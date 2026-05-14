import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import {
  applyRosterColumnMapping,
  detectRosterColumnMapping,
  selectRosterSheets,
} from "../src/rosterColumnMapping.js";

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

function readZipEntries(filePath) {
  const buffer = readFileSync(filePath);
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

function parseSheetRows(xmlText = "", sharedStrings = []) {
  return [...xmlText.matchAll(/<row\b[^>]*>[\s\S]*?<\/row>/g)].map((rowMatch) => {
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
}

function readWorkbookSheets(filePath) {
  const entries = readZipEntries(filePath);
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

  assert.equal(realSelection.building.mapping.buildingNumber, 1, "real building number should map to the actual building-number column");
  assert.equal(realSelection.building.mapping.buildingAddress, 2, "real building address should map to the actual address column");
  assert.equal(realSelection.building.mapping.relatedLandNumber, 6, "real building related land number should map to the actual related-land column");
  assert.equal(realSelection.building.mapping.shareNumerator, 10, "real building share numerator should map to the split numerator column");
  assert.equal(realSelection.building.mapping.shareDenominator, 12, "real building share denominator should skip the slash column");
  assert.equal(realSelection.building.mapping.shareAreaSqm, 13, "real building share area should map to the ownership share area column");
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
