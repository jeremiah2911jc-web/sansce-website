const XLSX_CONTENT_TYPES = {
  workbook: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
  worksheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
  rels: "application/vnd.openxmlformats-package.relationships+xml",
  core: "application/vnd.openxmlformats-package.core-properties+xml",
  app: "application/vnd.openxmlformats-officedocument.extended-properties+xml",
};

const LAND_HEADERS = [
  "地主編號",
  "地主姓名",
  "縣市",
  "行政區",
  "段別",
  "小段",
  "地號",
  "土地面積㎡",
  "土地面積坪",
  "持分分子",
  "持分分母",
  "持分比例",
  "持分面積㎡",
  "持分面積坪",
  "登記次序",
  "登記名義人",
  "受託人",
  "委託人",
  "權利型態",
  "公告土地現值",
  "公告現值年度",
  "申報地價",
  "申報地價年度",
  "登記日期",
  "登記原因",
  "原因發生日期",
  "權狀字號",
  "資料來源",
  "來源頁碼",
  "備註",
];

const BUILDING_HEADERS = [
  "建物編號",
  "所有人姓名",
  "縣市",
  "行政區",
  "段別",
  "小段",
  "地號",
  "建號",
  "建物門牌",
  "建物面積㎡",
  "持分分子",
  "持分分母",
  "持分比例",
  "備註",
];

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
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function landRowsForSheet(preview) {
  const rows = preview?.landRights ?? preview?.landRows ?? [];
  return rows.map((row) => [
    row.ownerReferenceId || row.landRightRowId || row.rowId || "",
    row.ownerName || "",
    row.city || "",
    row.district || "",
    row.section || "",
    row.subsection || "",
    row.lotNumber || row.landNumber || "",
    safeNumber(row.landAreaSqm),
    safeNumber(row.landAreaPing),
    row.shareNumerator || "",
    row.shareDenominator || "",
    safeNumber(row.shareRatio),
    safeNumber(row.shareAreaSqm),
    safeNumber(row.shareAreaPing),
    row.registrationOrder || "",
    row.registeredOwnerName || "",
    row.trusteeName || "",
    row.trustorName || "",
    row.ownershipType || "",
    safeNumber(row.announcedCurrentValue),
    row.announcedCurrentValueYear || "",
    safeNumber(row.declaredLandValue),
    row.declaredLandValueYear || "",
    row.registrationDate || "",
    row.registrationReason || "",
    row.causeDate || "",
    row.titleNumber || "",
    row.sourceFilename || "",
    row.sourcePage || "",
    row.notes || row.note || "",
  ]);
}

function buildingRowsForSheet(preview) {
  const rows = preview?.buildingRights ?? preview?.buildingRows ?? [];
  return rows.map((row) => [
    row.ownerReferenceId || row.buildingRightRowId || row.rowId || "",
    row.ownerName || "",
    row.city || "",
    row.district || "",
    row.section || "",
    row.subsection || "",
    row.lotNumber || row.relatedLandNumber || "",
    row.buildingNumber || "",
    row.address || "",
    safeNumber(row.buildingAreaSqm),
    row.shareNumerator || "",
    row.shareDenominator || "",
    safeNumber(row.shareRatio),
    row.notes || row.note || "",
  ]);
}

export function createRosterWorkbookBlob(preview) {
  const sheets = [
    ["土地清冊_匯入", [LAND_HEADERS, ...landRowsForSheet(preview)]],
    ["建物清冊_匯入", [BUILDING_HEADERS, ...buildingRowsForSheet(preview)]],
    ["整合紀錄_匯入", [["欄位", "內容"], ["狀態", "本工作表保留供後續整合紀錄使用"]]],
    ["分配條件_匯入", [["欄位", "內容"], ["狀態", "本工作表保留供後續分配條件使用"]]],
    ["欄位字典", [["欄位", "說明"], ["縣市 / 行政區 / 段別 / 小段 / 地號", "完整地籍定位欄位"], ["地主姓名", "信託案件優先填委託人 / 實際權利人"]]],
    ["下拉選單", [["類型", "值"], ["權利型態", "信託"], ["權利型態", "買賣"]]],
  ];
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
