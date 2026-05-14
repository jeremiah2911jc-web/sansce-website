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
  realWorkbookSummary = {
    landSheet: realSelection.land.name,
    landMissing: realSelection.land.requiredMissing,
    landPreviewRows: realLandRows.length,
    buildingSheet: realSelection.building.name,
    buildingMissing: realSelection.building.requiredMissing,
    buildingPreviewRows: realBuildingRows.length,
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
