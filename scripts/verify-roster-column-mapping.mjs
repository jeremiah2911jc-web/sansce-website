import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  applyRosterColumnMapping,
  buildRosterWorkbookMappingResult,
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
  BUILDING_PREVIEW_COLUMNS,
  BUILDING_TEMPLATE_HEADERS,
  LAND_EXPORT_HEADERS,
  LAND_PREVIEW_COLUMNS,
  LAND_TEMPLATE_HEADERS,
  ROSTER_STANDARD_SCHEMA_VERSION,
} from "../src/rosterStandardSchema.js";

const requireGoldenFixtures = process.argv.includes("--golden");
const realWorkbookPath = "/Users/jeremiah/Downloads/1130308新莊丹鳳段清冊.xlsx";
const realPdfPath = "/Users/jeremiah/Downloads/150,151,153.pdf";
const legacyV7TemplatePath = "public/sanze-roster-template-v7-protected.xlsx";

const DATA_QUALITY_THRESHOLDS = {
  maxMissingDenominatorRate: 0,
  maxShareAreaMismatchRate: 0,
  maxSuspiciousShareAreaSequenceRows: 0,
  maxMalformedShareDisplayRows: 0,
  maxLongAmountRows: 0,
  maxRawOtherRightWithoutStandardFieldsRows: 0,
  maxRequiredMissingWithHighConfidenceRows: 0,
};

if (requireGoldenFixtures) {
  assert.ok(existsSync(realWorkbookPath), `golden Excel fixture must exist: ${realWorkbookPath}`);
  assert.ok(existsSync(realPdfPath), `golden PDF fixture must exist: ${realPdfPath}`);
}

function row(excelRowNumber, values) {
  return { excelRowNumber, values };
}

const landRows = [
  row(1, ["土地基本資料", "土地基本資料", "土地基本資料", "所有權資料", "所有權資料", "所有權資料", "所有權資料", "所有權資料", "所有權資料"]),
  row(2, ["地段", "地號", "面積(㎡)", "登記次序", "所有權人(管理人)", "身分證字號", "權利範圍", "權利範圍", "權利範圍"]),
  row(3, ["", "", "", "", "", "", "分子", "/", "分母"]),
  row(4, ["丹鳳段", "123", "100", "0001", "權利人A", "A123****", "1", "/", "2"]),
  row(5, ["", "", "", "0002", "權利人B", "B123****", "1", "/", "2"]),
  row(6, ["", "", "", "", "", "", "", "", ""]),
];

const buildingRows = [
  row(1, ["建物基本資料", "建物基本資料", "面積(m2)", "面積(m2)", "面積(m2)", "所有權資料", "所有權資料", "所有權資料", "所有權資料"]),
  row(2, ["建號", "建物門牌號碼", "合計", "主建物", "附屬建物", "座落地號", "所有權人(管理人)", "權利範圍", "權利範圍"]),
  row(3, ["", "", "", "", "", "", "", "分子", "分母"]),
  row(4, ["456", "門牌A", "88.8", "70", "18.8", "123", "權利人A", "1", "1"]),
  row(5, ["", "", "", "", "", "", "", "", ""]),
];

const lowConfidenceRows = [
  row(1, ["項目", "面積", "姓名"]),
  row(2, ["丹鳳段123", "100", "權利人"]),
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
  row(3, ["", "", "", "", "", "", "", "", "", "", "", "0032", "抵押權", "國泰人壽保險股份有限公司", "林曾秋香", "全部", "林曾秋香", "180萬元", "共同擔保地號", "新北市新莊區清冊路"]),
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
const lowConfidenceSelection = selectRosterSheets({ 土地權屬清冊: lowConfidenceRows });
const lowConfidenceWorkbookResult = buildRosterWorkbookMappingResult(lowConfidenceSelection);
assert.equal(lowConfidenceSelection.land?.needsManualMapping, true, "low-confidence workbook should be routed to manual column mapping");
assert.equal(lowConfidenceWorkbookResult.needsColumnMapping, true, "low-confidence workbook should not proceed as a normal preview");
assert.ok(
  lowConfidenceWorkbookResult.columnMappingSummary.land?.requiredMissing.includes("shareDenominator"),
  "low-confidence workbook should keep missing denominator visible for manual review",
);

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

function getGeneratedColumnByHeader(rows, headerName) {
  const headers = rows[0]?.values ?? [];
  const normalizedHeaderName = normalizeText(headerName);
  const headerIndex = headers.findIndex((header) => normalizeText(header) === normalizedHeaderName);
  assert.notEqual(headerIndex, -1, `generated workbook should include ${headerName}`);
  return rows.slice(1)
    .map((row) => row.values?.[headerIndex] ?? "")
    .filter((value) => normalizeText(value));
}

function getSummaryValue(rows, itemName) {
  const match = rows.find((row) => normalizeText(row.values?.[0]) === normalizeText(itemName));
  assert.ok(match, `generated workbook summary should include ${itemName}`);
  return match.values?.[1] ?? "";
}

function countMalformedShareDisplayRows(rows) {
  return rows.filter((row) => {
    const display = normalizeText(row.shareDisplay || row.shareText || `${row.shareNumerator || ""} / ${row.shareDenominator || ""}`);
    return /\d+\s*[/／]\s*[/／]/.test(display) || /[/／]\s*$/.test(display) || display.includes("/ /");
  }).length;
}

function countLongAmountRows(rows) {
  return rows.filter((row) => {
    const amount = normalizeText(row.securedAmount || row.amount);
    return amount.length > 40 || amount.includes("擔保債權種類") || amount.includes("擔保債權確定期日");
  }).length;
}

function countRawOtherRightWithoutStandardFieldsRows(rows) {
  return rows.filter((row) => {
    const raw = normalizeText(row.rawOtherRightsText || row.rawOtherRightText);
    const hasStandardField = [
      row.otherRightRegistrationOrder,
      row.otherRightType,
      row.otherRightsType,
      row.otherRightHolder,
      row.otherRightsHolder,
      row.debtor,
      row.debtorAndDebtRatio,
      row.obligor,
      row.securedAmount,
      row.amount,
    ].some((value) => normalizeText(value));
    return Boolean(raw && !hasStandardField);
  }).length;
}

function buildDataQualitySummary(rows, { getShareAreaQuality = null } = {}) {
  const normalizedRows = (Array.isArray(rows) ? rows : []).filter((row) => {
    const numberLabel = normalizeText(row.landNumber || row.lotNumber || row.buildingNumber);
    if (["合計", "總計"].includes(numberLabel)) {
      return false;
    }
    return [
      row.ownerName,
      row.shareNumerator,
      row.shareDenominator,
      row.otherRightRegistrationOrder,
      row.otherRightType,
      row.otherRightsType,
      row.otherRightHolder,
      row.otherRightsHolder,
      row.debtor,
      row.obligor,
      row.securedAmount,
      row.amount,
    ].some((value) => normalizeText(value));
  });
  const shareQualities = normalizedRows.map((row) => (getShareAreaQuality ? getShareAreaQuality(row) : row));
  const rowCount = normalizedRows.length || 1;
  const missingDenominatorRows = normalizedRows.filter((row) => !normalizeText(row.shareDenominator) || isSlashOnly(row.shareDenominator)).length;
  const shareAreaMismatchRows = shareQualities.filter((quality) => (
    Array.isArray(quality.shareAreaValidationMessages)
      && quality.shareAreaValidationMessages.some((message) => normalizeText(message).includes("不一致"))
  )).length;
  const suspiciousShareAreaSequenceRows = shareQualities.filter((quality) => quality.shareAreaSuspectedColumnMisalignment).length;
  const malformedShareDisplayRows = countMalformedShareDisplayRows(normalizedRows);
  const longAmountRows = countLongAmountRows(normalizedRows);
  const rawOtherRightWithoutStandardFieldsRows = countRawOtherRightWithoutStandardFieldsRows(normalizedRows);

  return {
    rowCount: normalizedRows.length,
    missingDenominatorRows,
    missingDenominatorRate: missingDenominatorRows / rowCount,
    shareAreaMismatchRows,
    shareAreaMismatchRate: shareAreaMismatchRows / rowCount,
    suspiciousShareAreaSequenceRows,
    malformedShareDisplayRows,
    longAmountRows,
    rawOtherRightWithoutStandardFieldsRows,
  };
}

function assertDataQualityThresholds(summary, context) {
  assert.ok(summary.missingDenominatorRate <= DATA_QUALITY_THRESHOLDS.maxMissingDenominatorRate, `${context} denominator missing rate should stay below threshold`);
  assert.ok(summary.shareAreaMismatchRate <= DATA_QUALITY_THRESHOLDS.maxShareAreaMismatchRate, `${context} share area mismatch rate should stay below threshold`);
  assert.ok(summary.suspiciousShareAreaSequenceRows <= DATA_QUALITY_THRESHOLDS.maxSuspiciousShareAreaSequenceRows, `${context} should not contain sequence-like share area values`);
  assert.ok(summary.malformedShareDisplayRows <= DATA_QUALITY_THRESHOLDS.maxMalformedShareDisplayRows, `${context} should not contain malformed share displays`);
  assert.ok(summary.longAmountRows <= DATA_QUALITY_THRESHOLDS.maxLongAmountRows, `${context} amount fields should not absorb long prose`);
  assert.ok(summary.rawOtherRightWithoutStandardFieldsRows <= DATA_QUALITY_THRESHOLDS.maxRawOtherRightWithoutStandardFieldsRows, `${context} raw other-right text should not be the only retained other-right data`);
}

const REQUIRED_ROUNDTRIP_FIELDS = [
  "sourceType",
  "sourceFileName",
  "sourceFilename",
  "sourceSheetName",
  "sourceDocumentName",
  "sourcePageNumber",
  "sourcePage",
  "sourceRowNumber",
  "sourceBlockIndex",
  "sectionName",
  "landNumber",
  "buildingNumber",
  "ownerRegistrationOrder",
  "ownerName",
  "ownerIdNumber",
  "shareNumerator",
  "shareDenominator",
  "originalShareAreaSqm",
  "calculatedShareAreaSqm",
  "shareAreaDifferenceSqm",
  "validationStatus",
  "validationMessages",
  "otherRightRegistrationOrder",
  "otherRightType",
  "otherRightHolder",
  "debtor",
  "debtorAndDebtRatio",
  "obligor",
  "securedAmount",
  "securedClaimScope",
  "rawOtherRightText",
  "rawOtherRightsText",
  "note",
  "transcriptAddress",
  "floorLevel",
  "totalFloors",
  "structureType",
  "completionDate",
];

function assertJsonRoundtripKeepsFields(row, fieldNames, context) {
  const roundtrip = JSON.parse(JSON.stringify(row));
  fieldNames.forEach((fieldName) => {
    assert.ok(Object.prototype.hasOwnProperty.call(roundtrip, fieldName), `${context} JSON roundtrip should retain ${fieldName}`);
  });
  assert.ok(!JSON.stringify(roundtrip).match(/NaN|undefined|Infinity/), `${context} JSON roundtrip should not contain invalid numeric tokens`);
  return roundtrip;
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
      所有權人：林曾秋香統一編號：F200****住址：新北市清冊地址
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
assert.ok(!normalizeText(parsedTranscript.landRights[0].securedAmount).includes("擔保債權種類"), "PDF secured amount should not absorb claim-scope prose");
assert.ok(parsedTranscript.mortgages[0].attachedOwnerRegistrationOrders.includes("0001"), "PDF mortgage should record its attached ownership order");

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
  assert.equal(normalizeText(lot474FirstShareRow.section), "丹鳳段", "lot 474 first row should keep the section");
  assert.equal(normalizeNumberText(lot474FirstShareRow.lotNumber), "474", "lot 474 first row should keep the lot number");
  assert.equal(normalizeText(lot474FirstShareRow.ownerName), "林曾秋香", "lot 474 first row should keep the owner column");
  assert.equal(normalizeNumberText(lot474FirstShareRow.shareNumerator), "1386", "lot 474 first row should keep the share numerator");
  assert.equal(normalizeNumberText(lot474FirstShareRow.shareDenominator), "20000", "lot 474 first row should keep the share denominator");
  assert.equal(`${normalizeNumberText(lot474FirstShareRow.shareNumerator)} / ${normalizeNumberText(lot474FirstShareRow.shareDenominator)}`, "1386 / 20000", "lot 474 share display should be well-formed");
  assertClose(lot474FirstShareRow.shareAreaSqm, 54.482274, "lot 474 original share area should parse from workbook", 0.000001);
  assertNumericNotClose(lot474FirstShareRow.shareAreaSqm, 32, "lot 474 original share area must not be shifted from another row");
  assertClose(lot474FirstShareQuality.calculatedShareAreaSqm, 54.482274, "lot 474 calculated share area should match area x numerator / denominator", 0.000001);
  assertClose(lot474FirstShareQuality.shareAreaSqm, 54.482274, "lot 474 chosen share area should use calculated value", 0.000001);
  assertClose(lot474FirstShareQuality.originalShareAreaSqm, 54.482274, "lot 474 original share area should remain comparable to calculated area", 0.000001);
  assertClose(lot474FirstShareQuality.shareAreaDifferenceSqm, 0, "lot 474 first share-area difference should be zero", 0.000001);
  assert.equal(lot474FirstShareQuality.shareAreaValidationStatus, "持分面積檢核通過", "lot 474 first share-area validation should pass");
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
  assertClose(lot474SecondShareQuality.originalShareAreaSqm, 27.241137, "lot 474 second original share area should remain comparable", 0.000001);
  assertClose(lot474SecondShareQuality.shareAreaDifferenceSqm, 0, "lot 474 second share-area difference should be zero", 0.000001);

  const lot475QuarterShareRow = findLandRow(realLandRows, 475, 1, 4);
  assert.ok(lot475QuarterShareRow, "lot 475 row with 1 / 4 should exist");
  const lot475QuarterShareQuality = evaluateMappedLandRow(lot475QuarterShareRow);
  assertClose(lot475QuarterShareRow.landAreaSqm, 131.78, "lot 475 area should carry forward as 131.78 sqm");
  assertClose(lot475QuarterShareRow.shareAreaSqm, 32.945, "lot 475 original share area should parse as 32.945 sqm", 0.000001);
  assertClose(lot475QuarterShareQuality.calculatedShareAreaSqm, 32.945, "lot 475 calculated share area should be 131.78 x 1 / 4", 0.000001);
  assertClose(lot475QuarterShareQuality.originalShareAreaSqm, 32.945, "lot 475 original share area should stay on lot 475", 0.000001);
  assertClose(lot475QuarterShareQuality.shareAreaDifferenceSqm, 0, "lot 475 share-area difference should be zero", 0.000001);
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
    sourceType: "xlsx-column-mapped",
    sourceFilename: realWorkbookPath.split("/").at(-1),
    sourceFileName: realWorkbookPath.split("/").at(-1),
    sourceSheetName: realSelection.land.name,
    sourceRowNumber: lot474FirstShareRow.__rowNumber,
    sourceLocator: `${realSelection.land.name} / 第${lot474FirstShareRow.__rowNumber}列`,
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
  assert.ok(normalizeText(getGeneratedCellByHeader(generatedRealRows, "備註 / 他項權利內容摘要")).includes("共同擔保地號"), "generated workbook note column should not shift");

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
  assert.ok(existsSync(legacyV7TemplatePath), "legacy v7 template should remain available for compatibility");

  assert.deepEqual(LAND_PREVIEW_COLUMNS.map((column) => column.label), [
    "序號",
    "地段",
    "地號",
    "土地面積(㎡)",
    "登記次序",
    "所有權人(管理人)",
    "身分證字號",
    "權利範圍",
    "原始土地持分面積(㎡)",
    "系統驗算持分面積(㎡)",
    "持分面積差異(㎡)",
    "持分面積坪",
    "他項權利登記次序",
    "權利種類",
    "他項權利人",
    "債務人",
    "債務人及債務額比例",
    "設定義務人",
    "金額",
    "備註 / 他項權利內容摘要",
    "謄本地址",
    "來源頁 / 來源列",
    "檢核狀態",
    "檢核訊息",
  ], "land preview columns should be the single urban renewal standard schema");

  assert.deepEqual(BUILDING_PREVIEW_COLUMNS.map((column) => column.label), [
    "編號",
    "建號",
    "建物門牌號碼",
    "面積(m2)-合計",
    "面積(m2)-主建物",
    "面積(m2)-附屬建物",
    "座落地號",
    "登記次序",
    "所有權人(管理人)",
    "身分證字號",
    "權利範圍",
    "原始持分面積(m2)",
    "系統驗算持分面積(m2)",
    "持分面積差異(m2)",
    "持分面積坪",
    "他項權利登記次序",
    "權利種類",
    "他項權利人",
    "債務人",
    "債務人及債務額比例",
    "設定義務人",
    "備註 / 他項權利內容摘要",
    "謄本地址",
    "層次",
    "總層數",
    "構造",
    "建築完成日期",
    "來源頁 / 來源列",
    "檢核狀態",
    "檢核訊息",
  ], "building preview columns should be the single urban renewal standard schema");

  const generatedWorkbookSheets = readWorkbookSheetsFromBuffer(Buffer.from(await generatedBlob.arrayBuffer()));
  assert.ok(generatedWorkbookSheets["土地權屬清冊_系統產生"], "generated workbook should include standard generated land sheet");
  assert.ok(generatedWorkbookSheets["合法建物權屬清冊_系統產生"], "generated workbook should include standard generated building sheet");
  assert.ok(generatedWorkbookSheets["檢核摘要"], "generated workbook should include validation summary sheet");
  assert.ok(generatedWorkbookSheets["欄位字典"], "generated workbook should include field dictionary sheet");
  assertHeaderOrder(generatedWorkbookSheets["土地權屬清冊_系統產生"], LAND_EXPORT_HEADERS, "generated workbook land headers should follow the urban renewal schema");
  assertHeaderOrder(generatedWorkbookSheets["合法建物權屬清冊_系統產生"], BUILDING_EXPORT_HEADERS, "generated workbook building headers should follow the urban renewal schema");
  [
    "匯入來源",
    "土地權利列數",
    "建物權利列數",
    "他項權利資料列數",
    "權利範圍完整列數",
    "持分面積可驗算列數",
    "持分面積檢核通過列數",
    "需人工確認列數",
    "系統版本 / schema version",
  ].forEach((summaryItem) => getSummaryValue(generatedWorkbookSheets["檢核摘要"], summaryItem));

  const jsonRoundtripRow = assertJsonRoundtripKeepsFields({
    standardSchemaVersion: ROSTER_STANDARD_SCHEMA_VERSION,
    sourceType: "xlsx-column-mapped",
    sourceFileName: realWorkbookPath.split("/").at(-1),
    sourceFilename: realWorkbookPath.split("/").at(-1),
    sourceSheetName: realSelection.land.name,
    sourceDocumentName: "",
    sourcePageNumber: "",
    sourcePage: "",
    sourceRowNumber: lot474FirstShareRow.__rowNumber,
    sourceBlockIndex: "",
    landSequence: "1",
    sectionName: "丹鳳段",
    landNumber: "474",
    buildingNumber: "",
    ownerRegistrationOrder: lot474FirstShareRow.registrationOrder,
    ownerName: lot474FirstShareRow.ownerName,
    ownerIdNumber: lot474FirstShareRow.maskedIdentityCode,
    shareNumerator: lot474FirstShareRow.shareNumerator,
    shareDenominator: lot474FirstShareRow.shareDenominator,
    originalShareAreaSqm: lot474FirstShareQuality.originalShareAreaSqm,
    calculatedShareAreaSqm: lot474FirstShareQuality.calculatedShareAreaSqm,
    shareAreaDifferenceSqm: lot474FirstShareQuality.shareAreaDifferenceSqm,
    validationStatus: lot474FirstShareQuality.shareAreaValidationStatus,
    validationMessages: lot474FirstShareQuality.shareAreaValidationMessages,
    otherRightRegistrationOrder: lot474FirstShareRow.otherRightRegistrationOrder,
    otherRightType: "抵押權",
    otherRightHolder: lot474FirstShareRow.otherRightsHolder,
    debtor: lot474FirstShareRow.debtor,
    debtorAndDebtRatio: lot474FirstShareRow.debtorAndDebtRatio,
    obligor: lot474FirstShareRow.obligor,
    securedAmount: lot474FirstShareRow.amount,
    securedClaimScope: "",
    rawOtherRightText: "",
    rawOtherRightsText: "",
    note: lot474FirstShareRow.note,
    transcriptAddress: "清冊地址",
    floorLevel: "",
    totalFloors: "",
    structureType: "",
    completionDate: "",
  }, REQUIRED_ROUNDTRIP_FIELDS, "Excel current-case roster row");
  assert.equal(jsonRoundtripRow.standardSchemaVersion, ROSTER_STANDARD_SCHEMA_VERSION, "JSON roundtrip should keep the standard schema version");
  assert.equal(jsonRoundtripRow.otherRightType, "抵押權", "JSON roundtrip should keep other-right fields");
  assert.equal(jsonRoundtripRow.transcriptAddress, "清冊地址", "JSON roundtrip should keep transcript address fields");

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
  assert.ok(realBuildingRows.some((row) => normalizeText(row.buildingNumber)), "building roster should parse building numbers");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.buildingAddress)), "building roster should parse building doorplates");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.ownerName)), "building roster should parse building owners");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.floorLevel)), "building roster should retain floor levels");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.totalFloors)), "building roster should retain total floor counts");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.structure)), "building roster should retain structure text");
  assert.ok(realBuildingRows.some((row) => normalizeText(row.completionDate)), "building roster should retain completion dates");
  assert.ok(realBuildingRows.every((row) => normalizeText(row.ownerName) || !normalizeText(row.otherRightsHolder)), "building other-right fields must not overwrite ownership fields");
  assert.equal(countBadSharePartRows(realBuildingRows), 0, "building rows should not contain missing or slash-only share parts");
  const realWorkbookQualitySummary = buildDataQualitySummary(realLandRows, { getShareAreaQuality: evaluateMappedLandRow });
  assertDataQualityThresholds(realWorkbookQualitySummary, "real Excel golden land rows");

  realWorkbookSummary = {
    landSheet: realSelection.land.name,
    landMissing: realSelection.land.requiredMissing,
    landMapping: realSelection.land.mapping,
    landPreviewRows: realLandRows.length,
    landLot474CarryForwardRows: land474Rows.length,
    landBadSharePartRows: countBadSharePartRows(realLandRows),
    landQuality: realWorkbookQualitySummary,
    buildingSheet: realSelection.building.name,
    buildingMissing: realSelection.building.requiredMissing,
    buildingMapping: realSelection.building.mapping,
    buildingPreviewRows: realBuildingRows.length,
    buildingBadSharePartRows: countBadSharePartRows(realBuildingRows),
  };
}

let realPdfSummary = "not-found";
if (existsSync(realPdfPath)) {
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(readFileSync(realPdfPath)),
    disableWorker: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise;
  const pdfPages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent({ normalizeWhitespace: true });
    pdfPages.push({
      pageNumber,
      text: textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean)
        .join("\n"),
      textItemCount: textContent.items.length,
    });
  }
  assert.equal(pdf.numPages, 5, "real PDF should have five pages");
  assert.ok(pdfPages.every((page) => page.textItemCount > 0 && normalizeText(page.text)), "real PDF should expose a readable text layer on every page");
  const realPdf = parseLandRegisterTextPages(pdfPages, "150,151,153.pdf", "2026/05/15 00:00:00");
  const pdfOtherRightRows = realPdf.landRights.filter((row) => (
    normalizeText(row.otherRightType || row.otherRightsType)
    || normalizeText(row.otherRightHolder || row.otherRightsHolder)
    || normalizeText(row.securedAmount)
    || normalizeText(row.rawOtherRightsText)
  ));
  assert.equal(realPdf.landRights.length, 3, "real PDF should parse three land ownership rows");
  assert.equal(realPdf.mortgages.length, 2, "real PDF should parse two other-right blocks");
  assert.equal(pdfOtherRightRows.length, 2, "real PDF should attach two other-right rows to land rights");
  realPdf.landRights.forEach((row, index) => {
    assert.equal(row.standardSchemaVersion, ROSTER_STANDARD_SCHEMA_VERSION, `real PDF land row ${index + 1} should use the standard schema version`);
    assert.equal(row.sourceType, "pdfTranscript", `real PDF land row ${index + 1} should use the standard PDF source type`);
    assert.ok(normalizeText(row.sourceDocumentName), `real PDF land row ${index + 1} should keep source document name`);
    assert.ok(normalizeText(row.sourceFileName), `real PDF land row ${index + 1} should keep source file-name alias`);
    assert.ok(normalizeText(row.sourcePage), `real PDF land row ${index + 1} should keep source page`);
    assert.ok(normalizeText(row.sourcePageNumber), `real PDF land row ${index + 1} should keep source page-number alias`);
    assert.ok(normalizeText(row.sourceBlockIndex), `real PDF land row ${index + 1} should keep source block index`);
    assert.ok(normalizeText(row.sourceLocator), `real PDF land row ${index + 1} should keep source locator`);
    [
      "sectionName",
      "landNumber",
      "landAreaSqm",
      "ownerRegistrationOrder",
      "ownerName",
      "ownerIdNumber",
      "shareDisplay",
      "calculatedShareAreaSqm",
      "shareAreaPing",
      "validationStatus",
      "validationMessages",
    ].forEach((key) => {
      assert.ok(Object.prototype.hasOwnProperty.call(row, key), `real PDF land row ${index + 1} should expose standard field ${key}`);
    });
  });
  realPdf.mortgages.forEach((mortgage, index) => {
    assert.equal(normalizeText(mortgage.securedAmount), "363,480,000元", `real PDF other-right ${index + 1} should keep amount body only`);
    assert.ok(normalizeText(mortgage.securedAmount), `real PDF other-right ${index + 1} should keep amount`);
    assert.ok(!normalizeText(mortgage.securedAmount).includes("擔保債權種類"), `real PDF other-right ${index + 1} amount must not include claim-scope prose`);
    assert.ok(Number.isFinite(mortgage.securedAmountNumber), `real PDF other-right ${index + 1} should keep numeric amount`);
    assert.ok(normalizeText(mortgage.securedClaimScope), `real PDF other-right ${index + 1} should preserve claim scope outside amount`);
    assert.ok(normalizeText(mortgage.rawOtherRightsText), `real PDF other-right ${index + 1} should preserve raw other-right text`);
    assert.ok(normalizeText(mortgage.rawOtherRightText), `real PDF other-right ${index + 1} should preserve raw other-right compatibility alias`);
    assert.ok(normalizeText(mortgage.debtor), `real PDF other-right ${index + 1} debtor should be parsed or marked for review`);
    assert.ok(normalizeText(mortgage.obligor), `real PDF other-right ${index + 1} obligor should be parsed or marked for review`);
  });
  const realPdfQualitySummary = buildDataQualitySummary(realPdf.landRights);
  assertDataQualityThresholds(realPdfQualitySummary, "real PDF golden land rows");
  const generatedPdfBlob = createRosterWorkbookBlob({
    sourceType: "pdfTranscript",
    fileName: "150,151,153.pdf",
    landRights: realPdf.landRights,
    buildingRights: [],
    summary: {
      landCount: realPdf.landRights.length,
      buildingCount: 0,
      otherRightsRowCount: 2,
      rawOtherRightTextRowCount: 2,
      completeShareRows: realPdf.landRights.length,
      verifiableShareAreaRows: realPdf.landRights.length,
      consistentShareAreaRows: realPdf.landRights.length,
      manualReviewCount: realPdf.landRights.length,
      warningCount: realPdf.landRights.length,
    },
  });
  const generatedPdfRows = parseGeneratedWorkbookFirstSheetRows(Buffer.from(await generatedPdfBlob.arrayBuffer()));
  assertHeaderOrder(generatedPdfRows, LAND_EXPORT_HEADERS, "generated workbook from real PDF should use standard generated land headers");
  const generatedPdfAmounts = getGeneratedColumnByHeader(generatedPdfRows, "金額");
  assert.equal(generatedPdfAmounts.length, 2, "generated workbook from real PDF should export two amount values");
  assert.ok(generatedPdfAmounts.every((value) => !normalizeText(value).includes("擔保債權種類")), "generated workbook amount column must not include claim-scope prose");
  assert.ok(getGeneratedColumnByHeader(generatedPdfRows, "債務人").every((value) => normalizeText(value)), "generated workbook debtor column should be parsed or marked for review");
  assert.ok(getGeneratedColumnByHeader(generatedPdfRows, "設定義務人").every((value) => normalizeText(value)), "generated workbook obligor column should be parsed or marked for review");
  assert.ok(getGeneratedColumnByHeader(generatedPdfRows, "備註 / 他項權利內容摘要").some((value) => normalizeText(value).includes("擔保債權種類")), "generated workbook notes should preserve claim-scope prose outside amount");
  assert.ok(getGeneratedColumnByHeader(generatedPdfRows, "來源頁 / 來源列").every((value) => normalizeText(value)), "generated workbook from real PDF should export source page / row values");
  const generatedPdfSheets = readWorkbookSheetsFromBuffer(Buffer.from(await generatedPdfBlob.arrayBuffer()));
  assert.ok(generatedPdfSheets["土地權屬清冊_系統產生"], "generated workbook from real PDF should include generated land sheet");
  assert.ok(generatedPdfSheets["合法建物權屬清冊_系統產生"], "generated workbook from real PDF should include generated building sheet");
  assert.ok(generatedPdfSheets["檢核摘要"], "generated workbook from real PDF should include validation summary");
  assert.equal(normalizeText(getSummaryValue(generatedPdfSheets["檢核摘要"], "匯入來源")), "pdfTranscript", "generated workbook from real PDF should preserve source type in summary");
  assert.equal(normalizeNumberText(getSummaryValue(generatedPdfSheets["檢核摘要"], "他項權利資料列數")), "2", "generated workbook from real PDF should count two other-right rows");
  assert.equal(normalizeNumberText(getSummaryValue(generatedPdfSheets["檢核摘要"], "需人工確認列數")), "3", "generated workbook from real PDF should expose manual review count");
  assert.equal(countBadSharePartRows(realPdf.landRights), 0, "real PDF land rights should not contain missing or slash-only share parts");
  assert.ok(!JSON.stringify(realPdf.landRights).match(/NaN|undefined|Infinity/), "real PDF rows should not contain invalid numeric tokens");
  const realPdfRoundtripRow = assertJsonRoundtripKeepsFields({
    ...(realPdf.landRights.find((row) => normalizeText(row.rawOtherRightsText)) ?? realPdf.landRights[0]),
    buildingNumber: "",
    sourceSheetName: "",
    sourceRowNumber: "",
    floorLevel: "",
    totalFloors: "",
    structureType: "",
    completionDate: "",
    transcriptAddress: "",
  }, REQUIRED_ROUNDTRIP_FIELDS, "PDF current-case roster row");
  assert.equal(realPdfRoundtripRow.sourceType, "pdfTranscript", "PDF JSON roundtrip should retain source type");
  assert.ok(normalizeText(realPdfRoundtripRow.rawOtherRightsText), "PDF JSON roundtrip should retain raw other-right text");
  assert.ok(normalizeText(realPdfRoundtripRow.rawOtherRightText), "PDF JSON roundtrip should retain raw other-right alias");
  assert.ok(normalizeText(realPdfRoundtripRow.securedClaimScope), "PDF JSON roundtrip should retain secured claim scope");
  assert.ok(normalizeText(realPdfRoundtripRow.sourceLocator), "PDF JSON roundtrip should retain source locator");

  realPdfSummary = {
    pageCount: pdf.numPages,
    textLayerOk: true,
    landRightCount: realPdf.landRights.length,
    otherRightBlockCount: realPdf.mortgages.length,
    landRowsWithOtherRights: pdfOtherRightRows.length,
    amountColumnClean: true,
    debtorAndObligorParsedOrReview: true,
    quality: realPdfQualitySummary,
  };
}

console.log(JSON.stringify({
  ok: true,
  goldenFixturesRequired: requireGoldenFixtures,
  dataQualityThresholds: DATA_QUALITY_THRESHOLDS,
  fixtures: {
    landRequiredMissing: landMapping.requiredMissing,
    buildingRequiredMissing: buildingMapping.requiredMissing,
    lowConfidenceNeedsManualMapping: lowConfidence.needsManualMapping,
    lowConfidenceWorkbookNeedsColumnMapping: lowConfidenceWorkbookResult.needsColumnMapping,
  },
  realWorkbook: realWorkbookSummary,
  realPdf: realPdfSummary,
}, null, 2));
