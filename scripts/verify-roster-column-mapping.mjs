import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import {
  applyRosterColumnMapping,
  detectRosterColumnMapping,
  selectRosterSheets,
} from "../src/rosterColumnMapping.js";
import { evaluateLandShareArea } from "../src/rosterShareAreaValidation.js";
import {
  createBlankRosterTemplateWorkbookBlob,
  createRosterWorkbookBlob,
} from "../src/rosterXlsxExporter.js";
import { parseLandRegisterTextPages } from "../src/rosterPdfTextParser.js";
import {
  BUILDING_EXPORT_HEADERS,
  BUILDING_TEMPLATE_HEADERS,
  LAND_EXPORT_HEADERS,
  LAND_TEMPLATE_HEADERS,
  ROSTER_STANDARD_SCHEMA_VERSION,
} from "../src/rosterStandardSchema.js";

function row(excelRowNumber, values) {
  return { excelRowNumber, values };
}

const landRows = [
  row(1, ["土地基本資料", "土地基本資料", "土地基本資料", "所有權資料", "所有權資料", "所有權資料", "所有權資料", "所有權資料", "所有權資料"]),
  row(2, ["地段", "地號", "面積(㎡)", "登記次序", "所有權人(管理人)", "身分證字號", "權利範圍", "權利範圍", "權利範圍"]),
  row(3, ["", "", "", "", "", "", "分子", "/", "分母"]),
  row(4, ["丹鳳段", "123", "100", "0001", "測試權利人A", "A123****", "1", "/", "2"]),
  row(5, ["", "", "", "0002", "測試權利人B", "B123****", "1", "/", "2"]),
  row(6, ["", "", "", "", "", "", "", "", ""]),
];

const buildingRows = [
  row(1, ["建物基本資料", "建物基本資料", "面積(m2)", "面積(m2)", "面積(m2)", "所有權資料", "所有權資料", "所有權資料", "所有權資料"]),
  row(2, ["建號", "建物門牌號碼", "合計", "主建物", "附屬建物", "座落地號", "所有權人(管理人)", "權利範圍", "權利範圍"]),
  row(3, ["", "", "", "", "", "", "", "分子", "分母"]),
  row(4, ["456", "測試門牌", "88.8", "70", "18.8", "123", "測試權利人A", "1", "1"]),
  row(5, ["", "", "", "", "", "", "", "", ""]),
];

const lowConfidenceRows = [
  row(1, ["項目", "面積", "姓名"]),
  row(2, ["丹鳳段123", "100", "測試權利人"]),
];

const selection = selectRosterSheets({
  土地權屬清冊: landRows,
  合法建物權屬清冊: buildingRows,
});

assert.equal(selection.land?.name, "土地權屬清冊");
assert.equal(selection.building?.name, "合法建物權屬清冊");

const landMapping = detectRosterColumnMapping(landRows, "land");
assert.equal(landMapping.requiredMissing.length, 0, "land required fields should map from multi-row headers");
assert.equal(landMapping.mapping.shareNumerator, 6, "land share numerator should map from split share columns");
assert.equal(landMapping.mapping.shareDenominator, 8, "land share denominator should map from split share columns");

const buildingMapping = detectRosterColumnMapping(buildingRows, "building");
assert.equal(buildingMapping.requiredMissing.length, 0, "building required fields should map from multi-row headers");
assert.equal(buildingMapping.mapping.buildingAreaSqm, 2, "building total area should map to the total area column");
assert.equal(buildingMapping.mapping.shareNumerator, 7, "building share numerator should map");
assert.equal(buildingMapping.mapping.shareDenominator, 8, "building share denominator should map");

const appliedLand = applyRosterColumnMapping(selection.land);
assert.equal(appliedLand.rows.length, 2, "carry-forward ownership rows should remain two rows");
assert.equal(appliedLand.rows[1].section, "丹鳳段", "land section should carry forward");
assert.equal(appliedLand.rows[1].lotNumber, "123", "land number should carry forward");

const supplementalOtherRightsRows = [
  row(1, [
    "序號",
    "地段",
    "地號",
    "面積(㎡)",
    "登記次序",
    "所有權人(管理人)",
    "身分證字號",
    "權利範圍分子",
    "/",
    "權利範圍分母",
    "土地持分面積(㎡)",
    "他項權利登記次序",
    "權利種類",
    "他項權利人",
    "債務人",
    "債務人及債務額比例",
    "設定義務人",
    "金額",
    "備註",
    "謄本地址",
  ]),
  row(2, ["1", "丹鳳段", "474", "786.18", "0001", "林曾秋香", "F200****", "1386", "/", "20000", "54.482274", "", "", "", "", "", "", "", "", ""]),
  row(3, ["", "", "", "", "", "", "", "", "", "", "", "0032", "抵押權", "國泰人壽保險股份有限公司", "林曾秋香", "全部", "林曾秋香", "180萬元", "共同擔保地號", "新北市新莊區測試路"]),
];
const supplementalSelection = selectRosterSheets({ 土地權屬清冊: supplementalOtherRightsRows });
const supplementalRows = applyRosterColumnMapping(supplementalSelection.land).rows;
assert.equal(supplementalRows.length, 1, "other-right-only extension rows should merge into the current ownership row");
assert.equal(normalizeText(supplementalRows[0].otherRightsType), "抵押權", "supplemental other-right type should be retained");
assert.ok(normalizeText(supplementalRows[0].otherRightsHolder).includes("國泰人壽保險股份有限公司"), "supplemental other-right holder should be retained");
assert.equal(normalizeText(supplementalRows[0].debtor), "林曾秋香", "supplemental debtor should be retained");
assert.equal(normalizeText(supplementalRows[0].obligor), "林曾秋香", "supplemental obligor should be retained");
assert.equal(normalizeText(supplementalRows[0].amount), "180萬元", "supplemental secured amount should be retained");

const lowConfidence = detectRosterColumnMapping(lowConfidenceRows, "land");
assert.equal(lowConfidence.needsManualMapping, true, "low confidence sheets should require manual mapping");
assert.ok(lowConfidence.requiredMissing.includes("shareNumerator"), "missing share numerator should be reported");
assert.ok(lowConfidence.requiredMissing.includes("shareDenominator"), "missing share denominator should be reported");

function normalizeText(value) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
}

function normalizeNumberText(value) {
  return normalizeText(value).replace(/,/g, "");
}

function isSlashOnly(value) {
  return /^[/／]+$/.test(normalizeText(value));
}

function parseNumber(value) {
  const match = normalizeNumberText(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function numbersAreClose(value, expected, tolerance = 0.000001) {
  const parsed = parseNumber(value);
  return Number.isFinite(parsed) && Math.abs(parsed - expected) <= tolerance;
}

function assertClose(value, expected, message, tolerance = 0.000001) {
  const parsed = parseNumber(value);
  assert.ok(Number.isFinite(parsed), `${message}: value should be numeric`);
  assert.ok(Math.abs(parsed - expected) <= tolerance, `${message}: expected ${expected}, got ${parsed}`);
}

function assertNumericNotClose(value, unexpected, message, tolerance = 0.000001) {
  const parsed = parseNumber(value);
  assert.ok(!Number.isFinite(parsed) || Math.abs(parsed - unexpected) > tolerance, message);
}

function hasShare(rows, numerator, denominator) {
  return rows.some((row) => (
    normalizeNumberText(row.shareNumerator) === String(numerator)
    && normalizeNumberText(row.shareDenominator) === String(denominator)
  ));
}

function countBadSharePartRows(rows) {
  return rows.filter((row) => (
    isSlashOnly(row.shareNumerator)
    || isSlashOnly(row.shareDenominator)
    || (normalizeText(row.shareNumerator) && !normalizeText(row.shareDenominator))
  )).length;
}

function evaluateMappedLandRow(row) {
  return evaluateLandShareArea({
    landAreaSqm: row.landAreaSqm,
    shareNumerator: row.shareNumerator,
    shareDenominator: row.shareDenominator,
    originalShareAreaSqm: row.shareAreaSqm,
    existingShareAreaSqm: row.shareAreaSqm,
  });
}

function findLandRow(rows, lotNumber, numerator, denominator) {
  return rows.find((row) => (
    normalizeNumberText(row.lotNumber) === String(lotNumber)
    && normalizeNumberText(row.shareNumerator) === String(numerator)
    && normalizeNumberText(row.shareDenominator) === String(denominator)
  ));
}

function parseGeneratedWorkbookFirstSheetRows(buffer) {
  const entries = readZipEntriesFromBuffer(buffer);
  return parseSheetRows(entries.get("xl/worksheets/sheet1.xml") ?? "", []);
}

function assertHeaderOrder(rows, expectedHeaders, message) {
  const headers = (rows[0]?.values ?? []).map(normalizeText);
  assert.deepEqual(headers.slice(0, expectedHeaders.length), expectedHeaders.map(normalizeText), message);
}

function getGeneratedCellByHeader(rows, headerName) {
  const headers = rows[0]?.values ?? [];
  const normalizedHeaderName = normalizeText(headerName);
  const headerIndex = headers.findIndex((header) => normalizeText(header) === normalizedHeaderName);
  assert.notEqual(headerIndex, -1, `generated workbook should include ${headerName}`);
  return rows[1]?.values?.[headerIndex];
}

function readUInt16(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function readUInt32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function decodeXml(value = "") {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function getColumnIndex(cellReference = "") {
  const letters = cellReference.replace(/[0-9]/g, "");
  return letters.split("").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function getRowNumber(cellReference = "") {
  const match = cellReference.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function readZipEntriesFromBuffer(buffer) {
  let eocdOffset = -1;
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (readUInt32(buffer, offset) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }
  assert.notEqual(eocdOffset, -1, "xlsx end-of-central-directory must exist");
  const entryCount = readUInt16(buffer, eocdOffset + 10);
  let centralOffset = readUInt32(buffer, eocdOffset + 16);
  const entries = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    if (readUInt32(buffer, centralOffset) !== 0x02014b50) {
      break;
    }
    const method = readUInt16(buffer, centralOffset + 10);
    const compressedSize = readUInt32(buffer, centralOffset + 20);
    const fileNameLength = readUInt16(buffer, centralOffset + 28);
    const extraLength = readUInt16(buffer, centralOffset + 30);
    const commentLength = readUInt16(buffer, centralOffset + 32);
    const localHeaderOffset = readUInt32(buffer, centralOffset + 42);
    const fileName = buffer.subarray(centralOffset + 46, centralOffset + 46 + fileNameLength).toString("utf8").replace(/\\/g, "/");
    const localNameLength = readUInt16(buffer, localHeaderOffset + 26);
    const localExtraLength = readUInt16(buffer, localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedBytes = buffer.subarray(dataOffset, dataOffset + compressedSize);
    const bytes = method === 0 ? compressedBytes : inflateRawSync(compressedBytes);
    entries.set(fileName, bytes.toString("utf8"));
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipEntries(filePath) {
  return readZipEntriesFromBuffer(readFileSync(filePath));
}

function parseRelationships(xmlText = "") {
  return new Map([...xmlText.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)]
    .map((match) => [match[1], match[2]]));
}

function resolveWorkbookTarget(target = "") {
  const normalized = target.replace(/^\/+/, "");
  return normalized.startsWith("xl/") ? normalized : `xl/${normalized}`;
}

function parseSharedStrings(xmlText = "") {
  return [...xmlText.matchAll(/<si\b[\s\S]*?<\/si>/g)].map((match) => (
    [...match[0].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
      .map((textMatch) => decodeXml(textMatch[1]))
      .join("")
  ));
}

function getCellText(cellXml, sharedStrings) {
  const type = /<c\b[^>]*\bt="([^"]+)"/.exec(cellXml)?.[1] ?? "";
  if (type === "inlineStr") {
    return [...cellXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1])).join("");
  }
  const value = /<v>([\s\S]*?)<\/v>/.exec(cellXml)?.[1] ?? "";
  return type === "s" ? sharedStrings[Number(value)] ?? "" : decodeXml(value);
}

function parseCellReference(cellReference = "") {
  return {
    row: getRowNumber(cellReference),
    column: getColumnIndex(cellReference),
  };
}

function parseMergeRangesFromXmlText(xmlText = "") {
  return [...xmlText.matchAll(/<mergeCell\b[^>]*ref="([^"]+)"/g)]
    .map((match) => match[1])
    .map((reference) => {
      const [startReference, endReference] = reference.split(":");
      if (!startReference || !endReference) {
        return null;
      }
      return {
        start: parseCellReference(startReference),
        end: parseCellReference(endReference),
      };
    })
    .filter(Boolean);
}

function fillMergedSheetValues(rows, mergeRanges) {
  if (!mergeRanges.length) {
    return rows;
  }

  const rowsByNumber = new Map(rows.map((sheetRow) => [sheetRow.excelRowNumber, sheetRow]));
  const nextRows = rows.map((sheetRow) => ({
    ...sheetRow,
    values: [...sheetRow.values],
  }));
  const nextRowsByNumber = new Map(nextRows.map((sheetRow) => [sheetRow.excelRowNumber, sheetRow]));

  mergeRanges.forEach((range) => {
    const sourceValue = rowsByNumber.get(range.start.row)?.values?.[range.start.column];
    if (!normalizeText(sourceValue)) {
      return;
    }

    for (let rowNumber = range.start.row; rowNumber <= range.end.row; rowNumber += 1) {
      const sheetRow = nextRowsByNumber.get(rowNumber);
      if (!sheetRow) {
        continue;
      }
      for (let columnIndex = range.start.column; columnIndex <= range.end.column; columnIndex += 1) {
        if (!normalizeText(sheetRow.values[columnIndex])) {
          sheetRow.values[columnIndex] = sourceValue;
        }
      }
    }
  });

  return nextRows;
}

function parseSheetRows(xmlText = "", sharedStrings = []) {
  const rows = [...xmlText.matchAll(/<row\b[^>]*>[\s\S]*?<\/row>/g)].map((rowMatch) => {
    const rowXml = rowMatch[0];
    const values = [];
    for (const cellMatch of rowXml.matchAll(/<c\b[^>]*>[\s\S]*?<\/c>/g)) {
      const cellXml = cellMatch[0];
      const reference = /<c\b[^>]*\br="([^"]+)"/.exec(cellXml)?.[1] ?? "";
      values[getColumnIndex(reference)] = String(getCellText(cellXml, sharedStrings) ?? "").trim();
    }
    return {
      excelRowNumber: Number(/<row\b[^>]*\br="([^"]+)"/.exec(rowXml)?.[1]) || getRowNumber(/<c\b[^>]*\br="([^"]+)"/.exec(rowXml)?.[1] ?? ""),
      values,
    };
  });

  return fillMergedSheetValues(rows, parseMergeRangesFromXmlText(xmlText));
}

function readWorkbookSheets(filePath) {
  return readWorkbookSheetsFromEntries(readZipEntries(filePath));
}

function readWorkbookSheetsFromBuffer(buffer) {
  return readWorkbookSheetsFromEntries(readZipEntriesFromBuffer(buffer));
}

function readWorkbookSheetsFromEntries(entries) {
  const relationships = parseRelationships(entries.get("xl/_rels/workbook.xml.rels") ?? "");
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml") ?? "");
  const workbookXml = entries.get("xl/workbook.xml") ?? "";
  const sheets = {};

  for (const match of workbookXml.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    const sheetName = decodeXml(match[1]);
    const target = relationships.get(match[2]);
    if (!target) {
      continue;
    }
    sheets[sheetName] = parseSheetRows(entries.get(resolveWorkbookTarget(target)) ?? "", sharedStrings);
  }

  return sheets;
}

const parsedTranscript = parseLandRegisterTextPages([
  {
    pageNumber: 1,
    text: `
      資料管轄機關：新北市新莊地政事務所
      新莊區丹鳳段0474-0000地號
      土地標示部
      面積：786.18平方公尺
      民國114年01月公告土地現值：**112858元
      土地所有權部
      （0001）登記次序：0001
      登記日期：民國113年03月08日登記原因：買賣原因發生日期：民國113年03月08日
      所有權人：林曾秋香統一編號：F200822353住址：新北市測試地址
      權利範圍：20000分之1386當期申報地價：114年1月112858元
      土地他項權利部
      （0001）登記次序：0032
      權利種類：抵押權收件字號：新莊地所字第000001號
      權利人：國泰人壽保險股份有限公司統一編號：03374707
      債務人：林曾秋香設定義務人：林曾秋香擔保債權總金額：新臺幣**180萬元正
      標的登記次序：0001設定權利範圍：全部證明書字號：113新莊他字第000001號
      本謄本列印完畢
    `,
  },
], "mock-transcript.pdf", "2026/05/15 00:00:00");
assert.equal(parsedTranscript.landRights.length, 1, "readable transcript should parse one ownership row");
assert.equal(parsedTranscript.mortgages.length, 1, "readable transcript should parse one other-right block");
assert.equal(normalizeText(parsedTranscript.landRights[0].otherRightType), "抵押權", "PDF other-right type should be attached to the ownership row");
assert.ok(normalizeText(parsedTranscript.landRights[0].otherRightHolder).includes("國泰人壽保險股份有限公司"), "PDF other-right holder should be attached to the ownership row");
assert.equal(normalizeText(parsedTranscript.landRights[0].debtor), "林曾秋香", "PDF debtor should be retained on the ownership row");
assert.equal(normalizeText(parsedTranscript.landRights[0].obligor), "林曾秋香", "PDF obligor should be retained on the ownership row");
assert.ok(normalizeText(parsedTranscript.landRights[0].securedAmount).includes("180萬元"), "PDF secured amount text should be retained");
assert.ok(parsedTranscript.mortgages[0].attachedOwnerRegistrationOrders.includes("0001"), "PDF mortgage should record its attached ownership order");

const realWorkbookPath = "/Users/jeremiah/Downloads/1130308新莊丹鳳段清冊.xlsx";
let realWorkbookSummary = "not-found";
if (existsSync(realWorkbookPath)) {
  const realSelection = selectRosterSheets(readWorkbookSheets(realWorkbookPath));
  assert.ok(realSelection.land, "real workbook should expose a detectable land sheet");
  assert.ok(realSelection.building, "real workbook should expose a detectable building sheet");
  const realLandRows = applyRosterColumnMapping(realSelection.land).rows;
  const realBuildingRows = applyRosterColumnMapping(realSelection.building).rows;
  assert.ok(realLandRows.length > 0, "real workbook should create land preview rows");
  assert.ok(realBuildingRows.length > 0, "real workbook should create building preview rows");
  assert.equal(realSelection.land.name, "土地權屬清冊", "real workbook land sheet should be selected");
  assert.equal(realSelection.building.name, "合法建物權屬清冊", "real workbook building sheet should be selected");

  assert.equal(realSelection.land.mapping.section, 1, "real land section should map to the actual section column");
  assert.equal(realSelection.land.mapping.lotNumber, 2, "real land lot number should map to the actual lot column");
  assert.equal(realSelection.land.mapping.landAreaSqm, 3, "real land area should map to the actual area column");
  assert.equal(realSelection.land.mapping.shareNumerator, 7, "real land share numerator should map to the split numerator column");
  assert.equal(realSelection.land.mapping.shareDenominator, 9, "real land share denominator should skip the slash column");
  assert.equal(realSelection.land.mapping.shareAreaSqm, 10, "real land share area should map to the ownership share area column");
  assert.equal(realSelection.land.mapping.otherRightRegistrationOrder, 11, "real land other-right registration order should map to its own column");
  assert.equal(realSelection.land.mapping.otherRightsType, 12, "real land other-right type should map to the right type column");
  assert.equal(realSelection.land.mapping.otherRightsHolder, 13, "real land other-right holder should map to the holder column");
  assert.equal(realSelection.land.mapping.note, 18, "real land note should map to the note column");
  assert.equal(realSelection.land.mapping.transcriptAddress, 19, "real land transcript address should map to the address column");
  assert.notEqual(realSelection.land.mapping.ownerName, realSelection.land.mapping.otherRightsHolder, "land ownership owner must not map to other-rights holder");

  const land474Rows = realLandRows.filter((row) => normalizeText(row.section) === "丹鳳段" && normalizeNumberText(row.lotNumber) === "474");
  assert.ok(land474Rows.length > 1, "lot 474 should carry forward to multiple ownership rows");
  assert.ok(land474Rows.every((row) => normalizeText(row.section) === "丹鳳段"), "lot 474 rows should keep the section by carry-forward");
  assert.ok(realLandRows.some((row) => normalizeText(row.section) === "丹鳳段" && normalizeNumberText(row.lotNumber) === "475"), "lot 475 should be parsed after lot 474");
  assert.ok(
    realLandRows.some((row) => normalizeNumberText(row.lotNumber) === "475" && numbersAreClose(row.landAreaSqm, 131.78)),
    "lot 475 area should parse as 131.78 sqm",
  );
  assert.ok(hasShare(realLandRows, 655, 20000), "655 / 20,000 should parse to numerator 655 denominator 20000");
  assert.ok(hasShare(realLandRows, 1, 4), "1 / 4 should parse to numerator 1 denominator 4");
  assert.ok(
    realLandRows.some((row) => normalizeNumberText(row.shareDenominator) === "40000" && normalizeNumberText(row.shareNumerator)),
    "40,000 denominator rows should keep the numeric denominator instead of the slash column",
  );
  assert.equal(countBadSharePartRows(realLandRows), 0, "land rows should not contain missing or slash-only share parts");

  const lot474FirstShareRow = findLandRow(realLandRows, 474, 1386, 20000);
  assert.ok(lot474FirstShareRow, "lot 474 row with 1386 / 20000 should exist");
  const lot474FirstShareQuality = evaluateMappedLandRow(lot474FirstShareRow);
  assertClose(lot474FirstShareRow.landAreaSqm, 786.18, "lot 474 land area should parse as 786.18 sqm");
  assertClose(lot474FirstShareRow.shareAreaSqm, 54.482274, "lot 474 original share area should parse from workbook", 0.000001);
  assertNumericNotClose(lot474FirstShareRow.shareAreaSqm, 32, "lot 474 original share area must not be shifted from another row");
  assertClose(lot474FirstShareQuality.calculatedShareAreaSqm, 54.482274, "lot 474 calculated share area should match area x numerator / denominator", 0.000001);
  assertClose(lot474FirstShareQuality.shareAreaSqm, 54.482274, "lot 474 chosen share area should use calculated value", 0.000001);
  assertClose(lot474FirstShareQuality.shareAreaPing, 16.480889, "lot 474 share area ping should use 1 ping = 3.305785 sqm", 0.00001);
  assertNumericNotClose(lot474FirstShareQuality.shareAreaSqm, 1, "lot 474 share area sqm must not be a group index");
  assertNumericNotClose(lot474FirstShareQuality.shareAreaPing, 0.3025, "lot 474 share area ping must not be calculated from group index");
  assert.equal(normalizeText(lot474FirstShareRow.otherRightsType), "抵押權", "lot 474 other-right type should not be shifted into the holder column");
  assert.ok(normalizeText(lot474FirstShareRow.otherRightsHolder).includes("國泰人壽保險股份有限公司"), "lot 474 other-right holder should remain in the holder column");
  assert.equal(normalizeText(lot474FirstShareRow.debtor), "林曾秋香", "lot 474 debtor should map to debtor column");
  assert.equal(normalizeText(lot474FirstShareRow.obligor), "林曾秋香", "lot 474 obligor should map to obligor column");
  assert.equal(normalizeText(lot474FirstShareRow.amount), "180萬元", "lot 474 secured amount should map to amount column");
  assert.ok(normalizeText(lot474FirstShareRow.note).includes("共同擔保地號"), "lot 474 note should remain in the note column");

  const lot474SecondShareRow = findLandRow(realLandRows, 474, 693, 20000);
  assert.ok(lot474SecondShareRow, "lot 474 row with 693 / 20000 should exist");
  const lot474SecondShareQuality = evaluateMappedLandRow(lot474SecondShareRow);
  assertClose(lot474SecondShareRow.shareAreaSqm, 27.241137, "lot 474 second original share area should parse from workbook", 0.000001);
  assertNumericNotClose(lot474SecondShareRow.shareAreaSqm, 32, "lot 474 second original share area must not be shifted from lot 475");
  assertClose(lot474SecondShareQuality.calculatedShareAreaSqm, 27.241137, "lot 474 second calculated share area should match", 0.000001);

  const lot475QuarterShareRow = findLandRow(realLandRows, 475, 1, 4);
  assert.ok(lot475QuarterShareRow, "lot 475 row with 1 / 4 should exist");
  const lot475QuarterShareQuality = evaluateMappedLandRow(lot475QuarterShareRow);
  assertClose(lot475QuarterShareRow.landAreaSqm, 131.78, "lot 475 area should carry forward as 131.78 sqm");
  assertClose(lot475QuarterShareQuality.calculatedShareAreaSqm, 32.945, "lot 475 calculated share area should be 131.78 x 1 / 4", 0.000001);
  assert.ok(land474Rows.every((row) => numbersAreClose(row.landAreaSqm, 786.18)), "lot 474 ownership rows should carry forward land area");

  const lot474FortyThousandShareRows = land474Rows.filter((row) => normalizeNumberText(row.shareDenominator) === "40000");
  assert.ok(lot474FortyThousandShareRows.length > 0, "lot 474 should include rows with denominator 40000");
  assert.ok(
    lot474FortyThousandShareRows.every((row) => normalizeNumberText(row.shareNumerator) !== "666"),
    "40,000 denominator rows should preserve source numerators and must not be forced to 666",
  );

  const staleSequenceShareAreaQuality = evaluateLandShareArea({
    landAreaSqm: 786.18,
    shareNumerator: 1386,
    shareDenominator: 20000,
    originalShareAreaSqm: 1,
    existingShareAreaSqm: 1,
  });
  assertClose(staleSequenceShareAreaQuality.shareAreaSqm, 54.482274, "stale share area sequence values should be replaced by calculated share area", 0.000001);
  assert.equal(staleSequenceShareAreaQuality.shareAreaSuspectedColumnMisalignment, true, "stale sequence values should be flagged as possible column misalignment");

  const generatedRealLandRow = {
    landSequence: "1",
    section: lot474FirstShareRow.section,
    lotNumber: lot474FirstShareRow.lotNumber,
    landAreaSqm: parseNumber(lot474FirstShareRow.landAreaSqm),
    ownerRegistrationOrder: lot474FirstShareRow.registrationOrder,
    ownerName: lot474FirstShareRow.ownerName,
    ownerIdNumber: lot474FirstShareRow.maskedIdentityCode,
    shareNumerator: lot474FirstShareRow.shareNumerator,
    shareDenominator: lot474FirstShareRow.shareDenominator,
    originalShareAreaSqm: parseNumber(lot474FirstShareRow.shareAreaSqm),
    calculatedShareAreaSqm: lot474FirstShareQuality.calculatedShareAreaSqm,
    shareAreaSqm: lot474FirstShareQuality.shareAreaSqm,
    shareAreaPing: lot474FirstShareQuality.shareAreaPing,
    otherRightRegistrationOrder: lot474FirstShareRow.otherRightRegistrationOrder,
    otherRightType: lot474FirstShareRow.otherRightsType,
    otherRightHolder: lot474FirstShareRow.otherRightsHolder,
    debtor: lot474FirstShareRow.debtor,
    debtorAndDebtRatio: lot474FirstShareRow.debtorAndDebtRatio,
    obligor: lot474FirstShareRow.obligor,
    securedAmount: lot474FirstShareRow.amount,
    note: lot474FirstShareRow.note,
    transcriptAddress: lot474FirstShareRow.transcriptAddress,
  };
  const generatedRealBlob = createRosterWorkbookBlob({ landRights: [generatedRealLandRow], buildingRights: [] });
  const generatedRealRows = parseGeneratedWorkbookFirstSheetRows(Buffer.from(await generatedRealBlob.arrayBuffer()));
  assertHeaderOrder(generatedRealRows, LAND_EXPORT_HEADERS, "generated real land workbook headers should follow the urban renewal schema");
  assertClose(getGeneratedCellByHeader(generatedRealRows, "原始土地持分面積(㎡)"), 54.482274, "generated workbook original share area should preserve the source share area", 0.000001);
  assertNumericNotClose(getGeneratedCellByHeader(generatedRealRows, "原始土地持分面積(㎡)"), 32, "generated workbook original share area must not be shifted from lot 475");
  assertClose(getGeneratedCellByHeader(generatedRealRows, "系統驗算持分面積(㎡)"), 54.482274, "generated workbook calculated share area should match the recomputed value", 0.000001);
  assertClose(getGeneratedCellByHeader(generatedRealRows, "持分面積差異(㎡)"), 0, "generated workbook share area difference should be zero for the source row", 0.000001);
  assert.equal(normalizeText(getGeneratedCellByHeader(generatedRealRows, "權利種類")), "抵押權", "generated workbook should keep other-right type in the type column");
  assert.ok(normalizeText(getGeneratedCellByHeader(generatedRealRows, "他項權利人")).includes("國泰人壽保險股份有限公司"), "generated workbook should keep other-right holder in the holder column");
  assert.equal(normalizeText(getGeneratedCellByHeader(generatedRealRows, "債務人")), "林曾秋香", "generated workbook debtor column should not shift");
  assert.equal(normalizeText(getGeneratedCellByHeader(generatedRealRows, "設定義務人")), "林曾秋香", "generated workbook obligor column should not shift");
  assert.ok(normalizeText(getGeneratedCellByHeader(generatedRealRows, "備註")).includes("共同擔保地號"), "generated workbook note column should not shift");

  const generatedLandRow = {
    ownerReferenceId: "LR-CHECK",
    landRightRowId: "LR-CHECK",
    section: "丹鳳段",
    lotNumber: "474",
    landAreaSqm: 786.18,
    landAreaPing: 786.18 / 3.305785,
    shareNumerator: "1386",
    shareDenominator: "20000",
    originalShareAreaSqm: 1,
    shareAreaSqm: 1,
    shareAreaPing: 0.3025,
  };
  const generatedBlob = createRosterWorkbookBlob({ landRights: [generatedLandRow], buildingRights: [] });
  const generatedRows = parseGeneratedWorkbookFirstSheetRows(Buffer.from(await generatedBlob.arrayBuffer()));
  assertHeaderOrder(generatedRows, LAND_EXPORT_HEADERS, "generated land workbook headers should follow the urban renewal schema");
  assertClose(getGeneratedCellByHeader(generatedRows, "系統驗算持分面積(㎡)"), 54.482274, "generated workbook share area sqm should be recalculated", 0.000001);
  assertClose(getGeneratedCellByHeader(generatedRows, "持分面積坪"), 16.480889, "generated workbook share area ping should be recalculated", 0.00001);
  assertNumericNotClose(getGeneratedCellByHeader(generatedRows, "系統驗算持分面積(㎡)"), 1, "generated workbook share area column must not contain a group index");
  assertNumericNotClose(getGeneratedCellByHeader(generatedRows, "持分面積坪"), 0.3025, "generated workbook ping column must not contain group-index conversion");

  const blankTemplateBlob = createBlankRosterTemplateWorkbookBlob();
  const blankTemplateSheets = readWorkbookSheetsFromBuffer(Buffer.from(await blankTemplateBlob.arrayBuffer()));
  assert.ok(blankTemplateSheets["土地權屬清冊"], "blank template should include land roster sheet");
  assert.ok(blankTemplateSheets["合法建物權屬清冊"], "blank template should include building roster sheet");
  assert.ok(blankTemplateSheets["欄位字典"], "blank template should include field dictionary sheet");
  assert.ok(blankTemplateSheets["填寫說明"], "blank template should include instructions sheet");
  assert.ok(blankTemplateSheets["檢核規則"], "blank template should include validation rules sheet");
  assertHeaderOrder(blankTemplateSheets["土地權屬清冊"], LAND_TEMPLATE_HEADERS, "blank land template headers should follow the urban renewal schema");
  assertHeaderOrder(blankTemplateSheets["合法建物權屬清冊"], BUILDING_TEMPLATE_HEADERS, "blank building template headers should follow the urban renewal schema");
  assert.notEqual(Object.keys(blankTemplateSheets)[0], "土地清冊_匯入", "blank template should not use the old generated/v7 sheet name as the primary sheet");

  const generatedWorkbookSheets = readWorkbookSheetsFromBuffer(Buffer.from(await generatedBlob.arrayBuffer()));
  assert.ok(generatedWorkbookSheets["土地權屬清冊_系統產生"], "generated workbook should include standard generated land sheet");
  assert.ok(generatedWorkbookSheets["合法建物權屬清冊_系統產生"], "generated workbook should include standard generated building sheet");
  assert.ok(generatedWorkbookSheets["檢核摘要"], "generated workbook should include validation summary sheet");
  assert.ok(generatedWorkbookSheets["欄位字典"], "generated workbook should include field dictionary sheet");
  assertHeaderOrder(generatedWorkbookSheets["土地權屬清冊_系統產生"], LAND_EXPORT_HEADERS, "generated workbook land headers should follow the urban renewal schema");
  assertHeaderOrder(generatedWorkbookSheets["合法建物權屬清冊_系統產生"], BUILDING_EXPORT_HEADERS, "generated workbook building headers should follow the urban renewal schema");

  const jsonRoundtripRow = JSON.parse(JSON.stringify({
    standardSchemaVersion: ROSTER_STANDARD_SCHEMA_VERSION,
    landSequence: "1",
    sectionName: "丹鳳段",
    landNumber: "474",
    originalShareAreaSqm: lot474FirstShareQuality.originalShareAreaSqm,
    calculatedShareAreaSqm: lot474FirstShareQuality.calculatedShareAreaSqm,
    shareAreaDifferenceSqm: lot474FirstShareQuality.shareAreaDifferenceSqm,
    validationStatus: lot474FirstShareQuality.shareAreaValidationStatus,
    validationMessages: lot474FirstShareQuality.shareAreaValidationMessages,
    otherRightType: "抵押權",
    transcriptAddress: "測試地址",
  }));
  assert.equal(jsonRoundtripRow.standardSchemaVersion, ROSTER_STANDARD_SCHEMA_VERSION, "JSON roundtrip should keep the standard schema version");
  assert.equal(jsonRoundtripRow.otherRightType, "抵押權", "JSON roundtrip should keep other-right fields");
  assert.equal(jsonRoundtripRow.transcriptAddress, "測試地址", "JSON roundtrip should keep transcript address fields");

  assert.equal(realSelection.building.mapping.buildingNumber, 1, "real building number should map to the actual building-number column");
  assert.equal(realSelection.building.mapping.buildingAddress, 2, "real building address should map to the actual address column");
  assert.equal(realSelection.building.mapping.relatedLandNumber, 6, "real building related land number should map to the actual related-land column");
  assert.equal(realSelection.building.mapping.shareNumerator, 10, "real building share numerator should map to the split numerator column");
  assert.equal(realSelection.building.mapping.shareDenominator, 12, "real building share denominator should skip the slash column");
  assert.equal(realSelection.building.mapping.shareAreaSqm, 13, "real building share area should map to the ownership share area column");
  assert.equal(realSelection.building.mapping.otherRightRegistrationOrder, 14, "real building other-right registration order should map to its own column");
  assert.equal(realSelection.building.mapping.otherRightsType, 15, "real building other-right type should map to the right type column");
  assert.equal(realSelection.building.mapping.otherRightsHolder, 16, "real building other-right holder should map to the holder column");
  assert.notEqual(realSelection.building.mapping.ownerName, realSelection.building.mapping.otherRightsHolder, "building ownership owner must not map to other-rights holder");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.buildingNumber) && normalizeText(row.relatedLandNumber)), "building rows should include carried building number and related land number");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.shareNumerator) && normalizeText(row.shareDenominator) && normalizeText(row.shareAreaSqm)), "building rows should include share numerator, denominator, and share area");
  assert.equal(countBadSharePartRows(realBuildingRows), 0, "building rows should not contain missing or slash-only share parts");

  realWorkbookSummary = {
    landSheet: realSelection.land.name,
    landMissing: realSelection.land.requiredMissing,
    landMapping: realSelection.land.mapping,
    landPreviewRows: realLandRows.length,
    landLot474CarryForwardRows: land474Rows.length,
    landBadSharePartRows: countBadSharePartRows(realLandRows),
    buildingSheet: realSelection.building.name,
    buildingMissing: realSelection.building.requiredMissing,
    buildingMapping: realSelection.building.mapping,
    buildingPreviewRows: realBuildingRows.length,
    buildingBadSharePartRows: countBadSharePartRows(realBuildingRows),
  };
}

console.log(JSON.stringify({
  ok: true,
  fixtures: {
    landRequiredMissing: landMapping.requiredMissing,
    buildingRequiredMissing: buildingMapping.requiredMissing,
    lowConfidenceNeedsManualMapping: lowConfidence.needsManualMapping,
  },
  realWorkbook: realWorkbookSummary,
}, null, 2));
