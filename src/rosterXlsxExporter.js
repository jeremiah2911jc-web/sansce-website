import { evaluateLandShareArea } from "./rosterShareAreaValidation.js";
import {
  BUILDING_EXPORT_HEADERS,
  BUILDING_TEMPLATE_HEADERS,
  LAND_EXPORT_HEADERS,
  LAND_TEMPLATE_HEADERS,
  ROSTER_STANDARD_SCHEMA_VERSION,
  getRosterStandardDictionaryRows,
} from "./rosterStandardSchema.js";

const XLSX_CONTENT_TYPES = {
  workbook: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
  worksheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
  rels: "application/vnd.openxmlformats-package.relationships+xml",
  core: "application/vnd.openxmlformats-package.core-properties+xml",
  app: "application/vnd.openxmlformats-officedocument.extended-properties+xml",
};

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnName(index) {
  let number = index + 1;
  let name = "";

  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }

  return name;
}

function worksheetXml(rows) {
  const rowXml = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
      const isNumber = typeof value === "number" && Number.isFinite(value);
      return isNumber
        ? `<c r="${reference}"><v>${value}</v></c>`
        : `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value ?? "")}</t></is></c>`;
    }).join("");

    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function workbookXml(sheetNames) {
  const sheets = sheetNames.map((name, index) => (
    `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
  )).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheets}</sheets>
</workbook>`;
}

function workbookRelsXml(sheetCount) {
  const sheetRelationships = Array.from({ length: sheetCount }, (_, index) => (
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  )).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRelationships}
</Relationships>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function contentTypesXml(sheetCount) {
  const sheetOverrides = Array.from({ length: sheetCount }, (_, index) => (
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="${XLSX_CONTENT_TYPES.worksheet}"/>`
  )).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="${XLSX_CONTENT_TYPES.rels}"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="${XLSX_CONTENT_TYPES.workbook}"/>
  <Override PartName="/docProps/core.xml" ContentType="${XLSX_CONTENT_TYPES.core}"/>
  <Override PartName="/docProps/app.xml" ContentType="${XLSX_CONTENT_TYPES.app}"/>
  ${sheetOverrides}
</Types>`;
}

function corePropertiesXml() {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Sanze generated roster</dc:title>
  <dc:creator>sanze-evaluation-system</dc:creator>
  <cp:lastModifiedBy>sanze-evaluation-system</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

function appPropertiesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Sanze Evaluation System</Application>
</Properties>`;
}

function createCrc32Table() {
  return Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
  });
}

const CRC32_TABLE = createCrc32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function concatBytes(chunks) {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path);
    const dataBytes = encoder.encode(file.content);
    const checksum = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0x0800);
    writeUint16(localHeader, 8, 0);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, dataBytes.length);
    writeUint32(localHeader, 22, dataBytes.length);
    writeUint16(localHeader, 26, nameBytes.length);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0x0800);
    writeUint16(centralHeader, 10, 0);
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, dataBytes.length);
    writeUint32(centralHeader, 24, dataBytes.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 8, files.length);
  writeUint16(endRecord, 10, files.length);
  writeUint32(endRecord, 12, centralDirectory.length);
  writeUint32(endRecord, 16, offset);

  return concatBytes([...localParts, centralDirectory, endRecord]);
}

function safeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : "";
}

function joinMessages(value) {
  return Array.isArray(value) ? value.filter(Boolean).join("；") : String(value ?? "");
}

function getLandShareAreaQuality(row) {
  return evaluateLandShareArea({
    landAreaSqm: row.landAreaSqm,
    shareNumerator: row.shareNumerator,
    shareDenominator: row.shareDenominator,
    originalShareAreaSqm: row.originalShareAreaSqm || row.excelShareAreaSqm,
    existingShareAreaSqm: row.shareAreaSqm,
  });
}

function getBuildingShareAreaQuality(row) {
  return evaluateLandShareArea({
    landAreaSqm: row.buildingTotalAreaSqm || row.buildingAreaSqm,
    shareNumerator: row.shareNumerator,
    shareDenominator: row.shareDenominator,
    originalShareAreaSqm: row.originalShareAreaSqm || row.excelShareAreaSqm,
    existingShareAreaSqm: row.shareAreaSqm,
  });
}

function landRowsForSheet(preview) {
  const rows = preview?.landRights ?? preview?.landRows ?? [];
  return rows.map((row) => {
    const shareAreaQuality = getLandShareAreaQuality(row);

    return [
      row.landSequence || row.ownerReferenceId || row.landRightRowId || row.rowId || "",
      row.sectionName || row.section || "",
      row.landNumber || row.lotNumber || "",
      safeNumber(row.landAreaSqm),
      row.ownerRegistrationOrder || row.registrationOrder || "",
      row.ownerName || "",
      row.ownerIdNumber || row.maskedIdentityCode || "",
      row.shareNumerator || "",
      "/",
      row.shareDenominator || "",
      safeNumber(shareAreaQuality.originalShareAreaSqm),
      safeNumber(shareAreaQuality.calculatedShareAreaSqm),
      safeNumber(shareAreaQuality.shareAreaDifferenceSqm),
      safeNumber(shareAreaQuality.shareAreaPing),
      row.otherRightRegistrationOrder || "",
      row.otherRightType || row.otherRightsType || "",
      row.otherRightHolder || row.otherRightsHolder || "",
      row.debtor || "",
      row.debtorAndDebtRatio || "",
      row.obligor || "",
      row.securedAmount || row.amount || "",
      row.note || row.notes || "",
      row.transcriptAddress || row.address || "",
      shareAreaQuality.shareAreaValidationStatus || row.shareAreaValidationStatus || row.validationStatus || "",
      joinMessages(row.validationMessages?.length ? row.validationMessages : shareAreaQuality.shareAreaValidationMessages),
    ];
  });
}

function buildingRowsForSheet(preview) {
  const rows = preview?.buildingRights ?? preview?.buildingRows ?? [];
  return rows.map((row) => {
    const shareAreaQuality = getBuildingShareAreaQuality(row);

    return [
      row.buildingSequence || row.ownerReferenceId || row.buildingRightRowId || row.rowId || "",
      row.buildingNumber || "",
      row.buildingDoorplate || row.buildingAddress || row.address || "",
      safeNumber(row.buildingTotalAreaSqm || row.buildingAreaSqm),
      safeNumber(row.mainBuildingAreaSqm),
      safeNumber(row.accessoryBuildingAreaSqm),
      row.locatedLandNumber || row.relatedLandNumber || row.lotNumber || "",
      row.ownerRegistrationOrder || row.registrationOrder || "",
      row.ownerName || "",
      row.ownerIdNumber || row.maskedIdentityCode || "",
      row.shareNumerator || "",
      "/",
      row.shareDenominator || "",
      safeNumber(shareAreaQuality.originalShareAreaSqm),
      safeNumber(shareAreaQuality.calculatedShareAreaSqm),
      safeNumber(shareAreaQuality.shareAreaDifferenceSqm),
      safeNumber(shareAreaQuality.shareAreaPing),
      row.otherRightRegistrationOrder || "",
      row.otherRightType || row.otherRightsType || "",
      row.otherRightHolder || row.otherRightsHolder || "",
      row.debtor || "",
      row.debtorAndDebtRatio || "",
      row.obligor || "",
      row.note || row.notes || "",
      row.transcriptAddress || "",
      row.floorLevel || "",
      row.totalFloors || "",
      row.structureType || row.structure || "",
      row.completionDate || "",
      shareAreaQuality.shareAreaValidationStatus || row.shareAreaValidationStatus || row.validationStatus || "",
      joinMessages(row.validationMessages?.length ? row.validationMessages : shareAreaQuality.shareAreaValidationMessages),
    ];
  });
}

export function createRosterWorkbookBlob(preview) {
  const summary = preview?.summary ?? {};
  const landRows = preview?.landRights ?? preview?.landRows ?? [];
  const buildingRows = preview?.buildingRights ?? preview?.buildingRows ?? [];
  const otherRightsRowCount = [...landRows, ...buildingRows].filter((row) => (
    row.otherRightType || row.otherRightsType || row.otherRightHolder || row.otherRightsHolder || row.debtor || row.obligor
  )).length;
  const validationWarningCount = [...landRows, ...buildingRows].filter((row) => (
    Array.isArray(row.validationMessages) && row.validationMessages.length
  )).length;
  const sheets = [
    ["土地權屬清冊_系統產生", [LAND_EXPORT_HEADERS, ...landRowsForSheet(preview)]],
    ["合法建物權屬清冊_系統產生", [BUILDING_EXPORT_HEADERS, ...buildingRowsForSheet(preview)]],
    ["檢核摘要", [
      ["項目", "內容"],
      ["匯入檔名", preview?.fileName || preview?.sourceFilename || ""],
      ["匯入時間", preview?.importedAt || preview?.updatedAt || ""],
      ["土地權利列數", summary.landCount ?? landRows.length],
      ["建物權利列數", summary.buildingCount ?? buildingRows.length],
      ["權利範圍完整列數", summary.completeShareRows ?? ""],
      ["持分面積可驗算列數", summary.verifiableShareAreaRows ?? ""],
      ["持分面積檢核通過列數", summary.consistentShareAreaRows ?? ""],
      ["持分面積差異警告列數", summary.shareAreaWarningRows ?? validationWarningCount],
      ["他項權利資料列數", otherRightsRowCount],
      ["缺少縣市 / 行政區提示", summary.fallbackLandIdentityCount ?? ""],
      ["不可匯入警告數", summary.warningCount ?? validationWarningCount],
      ["系統版本 / schema version", ROSTER_STANDARD_SCHEMA_VERSION],
    ]],
    ["欄位字典", [["欄位", "欄位名稱", "用途"], ...getRosterStandardDictionaryRows()]],
  ];
  return createWorkbookBlob(sheets);
}

export function createBlankRosterTemplateWorkbookBlob() {
  const sheets = [
    ["土地權屬清冊", [LAND_TEMPLATE_HEADERS]],
    ["合法建物權屬清冊", [BUILDING_TEMPLATE_HEADERS]],
    ["欄位字典", [["欄位", "欄位名稱", "用途"], ...getRosterStandardDictionaryRows()]],
    ["填寫說明", [
      ["項目", "說明"],
      ["填寫順序", "先填標示部，再逐列填所有權部；同一地號或建號多位所有權人可沿用標示部資料。"],
      ["權利範圍", "請分別填寫分子與分母，中間斜線欄保留 /。"],
      ["他項權利", "他項權利資料請填入他項權利部，不要填入所有權人欄位。"],
      ["匯入方式", "上傳後系統會先建立預覽與檢核摘要，確認後才寫入案件。"],
    ]],
    ["檢核規則", [
      ["規則", "說明"],
      ["土地持分面積", "土地持分面積 = 土地面積 × 分子 ÷ 分母。"],
      ["建物持分面積", "建物持分面積 = 建物面積 × 分子 ÷ 分母。"],
      ["權利範圍分母", "分母不可為 0，缺漏時會列為待確認。"],
      ["資料沿用", "地號 / 建號相同的多筆所有權人可沿用標示部資料。"],
      ["他項權利", "他項權利資料不可填入所有權人欄位，也不可覆蓋所有權資料。"],
    ]],
  ];
  return createWorkbookBlob(sheets);
}

function createWorkbookBlob(sheets) {
  const files = [
    { path: "[Content_Types].xml", content: contentTypesXml(sheets.length) },
    { path: "_rels/.rels", content: rootRelsXml() },
    { path: "docProps/core.xml", content: corePropertiesXml() },
    { path: "docProps/app.xml", content: appPropertiesXml() },
    { path: "xl/workbook.xml", content: workbookXml(sheets.map(([name]) => name)) },
    { path: "xl/_rels/workbook.xml.rels", content: workbookRelsXml(sheets.length) },
    ...sheets.map(([, rows], index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: worksheetXml(rows),
    })),
  ];

  return new Blob([zipStore(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
