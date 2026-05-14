const MAX_HEADER_SCAN_ROWS = 8;
const MAX_HEADER_DEPTH = 3;
const MATCH_THRESHOLD = 58;
const STRONG_MATCH_THRESHOLD = 82;

const FIELD_GROUPS = {
  land: {
    label: "土地清冊",
    sheetKeywords: ["土地", "土地權屬", "土地清冊", "land"],
    requiredFieldIds: ["section", "lotNumber", "landAreaSqm", "ownerName", "shareNumerator", "shareDenominator"],
    carryForwardFieldIds: [
      "city",
      "district",
      "section",
      "subsection",
      "lotNumber",
      "landAreaSqm",
      "announcedCurrentValue",
      "announcedCurrentValueYear",
      "declaredLandValue",
      "declaredLandValueYear",
    ],
    ownershipSignalFieldIds: ["registrationOrder", "ownerReferenceId", "ownerName", "maskedIdentityCode", "shareNumerator", "shareDenominator", "shareText"],
    fields: [
      { id: "city", label: "縣市", outputHeaders: ["縣市"], aliases: ["縣市", "市縣", "city", "county"] },
      { id: "district", label: "行政區", outputHeaders: ["行政區"], aliases: ["行政區", "鄉鎮市區", "區", "district", "town"] },
      { id: "section", label: "地段", outputHeaders: ["段別", "地段"], aliases: ["地段", "段別", "段名", "section"] },
      { id: "subsection", label: "小段", outputHeaders: ["小段"], aliases: ["小段", "小段別", "subsection"] },
      { id: "lotNumber", label: "地號", outputHeaders: ["地號"], aliases: ["地號", "土地地號", "地段地號", "lotNo", "lotNumber", "parcelNumber"] },
      {
        id: "landAreaSqm",
        label: "土地面積",
        outputHeaders: ["土地面積㎡", "土地面積"],
        aliases: ["土地面積㎡", "土地面積", "土地面積m2", "面積㎡", "面積m2", "面積平方公尺"],
        weakAliases: ["面積"],
        negativeKeywords: ["持分", "權利", "主建物", "附屬"],
      },
      { id: "registrationOrder", label: "登記次序", outputHeaders: ["登記次序"], aliases: ["登記次序", "登記順位", "次序"] },
      { id: "ownerReferenceId", label: "權利人編號", outputHeaders: ["地主編號"], aliases: ["地主編號", "權利人編號", "所有權人編號", "參考編號", "編號"] },
      {
        id: "ownerName",
        label: "所有權人",
        outputHeaders: ["所有權人", "地主姓名"],
        aliases: ["所有權人", "所有權人管理人", "地主姓名", "姓名", "名稱"],
        negativeKeywords: ["他項", "債務", "義務"],
      },
      { id: "maskedIdentityCode", label: "身分證字號", outputHeaders: ["身分證字號"], aliases: ["身分證字號", "身分證", "統一編號", "統編", "證號", "識別碼", "前碼"] },
      { id: "shareText", label: "權利範圍", outputHeaders: ["權利範圍"], aliases: ["權利範圍", "持分", "應有部分"] },
      { id: "shareNumerator", label: "權利範圍分子", outputHeaders: ["持分分子"], aliases: ["權利範圍分子", "持分分子", "應有部分分子", "分子"] },
      { id: "shareDenominator", label: "權利範圍分母", outputHeaders: ["持分分母"], aliases: ["權利範圍分母", "持分分母", "應有部分分母", "分母"] },
      {
        id: "shareAreaSqm",
        label: "土地持分面積",
        outputHeaders: ["土地持分面積㎡", "持分面積㎡"],
        aliases: ["土地持分面積㎡", "持分面積㎡", "持分面積m2", "權利範圍面積"],
      },
      { id: "announcedCurrentValue", label: "公告現值", outputHeaders: ["公告土地現值"], aliases: ["公告土地現值", "公告現值"] },
      { id: "announcedCurrentValueYear", label: "公告現值年度", outputHeaders: ["公告現值年度"], aliases: ["公告現值年度", "公告土地現值年度"] },
      { id: "declaredLandValue", label: "申報地價", outputHeaders: ["申報地價"], aliases: ["申報地價", "當期申報地價"] },
      { id: "declaredLandValueYear", label: "申報地價年度", outputHeaders: ["申報地價年度"], aliases: ["申報地價年度"] },
      { id: "address", label: "謄本地址", outputHeaders: ["謄本地址", "地址"], aliases: ["謄本地址", "地址", "通訊地址", "戶籍地址", "住址"] },
      { id: "otherRightsType", label: "他項權利種類", outputHeaders: ["他項權利種類"], aliases: ["他項權利種類", "他項權利"] },
      { id: "otherRightsHolder", label: "他項權利人", outputHeaders: ["他項權利人"], aliases: ["他項權利人"] },
      { id: "debtor", label: "債務人", outputHeaders: ["債務人"], aliases: ["債務人"] },
      { id: "obligor", label: "設定義務人", outputHeaders: ["設定義務人"], aliases: ["設定義務人", "義務人"] },
      { id: "amount", label: "金額", outputHeaders: ["金額"], aliases: ["金額", "債權額", "擔保債權"] },
      { id: "note", label: "備註", outputHeaders: ["備註"], aliases: ["備註", "說明", "備考"] },
    ],
  },
  building: {
    label: "建物清冊",
    sheetKeywords: ["建物", "合法建物", "建物權屬", "building"],
    requiredFieldIds: ["buildingNumber", "buildingAddress", "buildingAreaSqm", "relatedLandNumber", "ownerName", "shareNumerator", "shareDenominator"],
    carryForwardFieldIds: [
      "city",
      "district",
      "section",
      "subsection",
      "relatedLandNumber",
      "buildingNumber",
      "buildingAddress",
      "buildingAreaSqm",
      "mainBuildingAreaSqm",
      "accessoryBuildingAreaSqm",
      "floorLevel",
      "totalFloors",
      "structure",
      "completionDate",
    ],
    ownershipSignalFieldIds: ["registrationOrder", "ownerReferenceId", "ownerName", "maskedIdentityCode", "shareNumerator", "shareDenominator", "shareText"],
    fields: [
      { id: "city", label: "縣市", outputHeaders: ["縣市"], aliases: ["縣市", "市縣", "city", "county"] },
      { id: "district", label: "行政區", outputHeaders: ["行政區"], aliases: ["行政區", "鄉鎮市區", "區", "district", "town"] },
      { id: "section", label: "地段", outputHeaders: ["段別", "地段"], aliases: ["地段", "段別", "段名", "section"] },
      { id: "subsection", label: "小段", outputHeaders: ["小段"], aliases: ["小段", "小段別", "subsection"] },
      { id: "buildingNumber", label: "建號", outputHeaders: ["建號"], aliases: ["建號", "建物建號", "buildingNumber"] },
      { id: "buildingAddress", label: "建物門牌", outputHeaders: ["門牌"], aliases: ["建物門牌號碼", "建物門牌", "門牌號碼", "門牌", "地址"] },
      {
        id: "buildingAreaSqm",
        label: "建物總面積",
        outputHeaders: ["建物面積㎡", "建物面積"],
        aliases: ["建物總面積", "建物面積㎡", "建物面積m2", "面積㎡合計", "面積m2合計", "面積合計", "總面積", "合計"],
        weakAliases: ["面積㎡", "面積m2", "面積"],
        negativeKeywords: ["持分", "主建物", "附屬"],
      },
      { id: "mainBuildingAreaSqm", label: "主建物面積", outputHeaders: ["主建物面積㎡"], aliases: ["主建物面積", "主建物"] },
      { id: "accessoryBuildingAreaSqm", label: "附屬建物面積", outputHeaders: ["附屬建物面積㎡"], aliases: ["附屬建物面積", "附屬建物"] },
      { id: "relatedLandNumber", label: "座落地號", outputHeaders: ["對應地號", "座落地號"], aliases: ["座落地號", "坐落地號", "座落土地地號", "座落地段地號", "對應地號", "土地地號", "地號"] },
      { id: "registrationOrder", label: "登記次序", outputHeaders: ["登記次序"], aliases: ["登記次序", "登記順位", "次序"] },
      { id: "ownerReferenceId", label: "權利人編號", outputHeaders: ["地主編號"], aliases: ["地主編號", "權利人編號", "所有權人編號", "參考編號", "編號"] },
      {
        id: "ownerName",
        label: "所有權人",
        outputHeaders: ["所有權人", "地主姓名"],
        aliases: ["所有權人", "所有權人管理人", "地主姓名", "姓名", "名稱"],
        negativeKeywords: ["他項", "債務", "義務"],
      },
      { id: "maskedIdentityCode", label: "身分證字號", outputHeaders: ["身分證字號"], aliases: ["身分證字號", "身分證", "統一編號", "統編", "證號", "識別碼", "前碼"] },
      { id: "shareText", label: "權利範圍", outputHeaders: ["權利範圍"], aliases: ["權利範圍", "持分", "應有部分"] },
      { id: "shareNumerator", label: "權利範圍分子", outputHeaders: ["持分分子"], aliases: ["權利範圍分子", "持分分子", "應有部分分子", "分子"] },
      { id: "shareDenominator", label: "權利範圍分母", outputHeaders: ["持分分母"], aliases: ["權利範圍分母", "持分分母", "應有部分分母", "分母"] },
      { id: "shareAreaSqm", label: "持分面積", outputHeaders: ["建物持分面積㎡", "持分面積㎡"], aliases: ["建物持分面積㎡", "持分面積㎡", "持分面積m2"] },
      { id: "floorLevel", label: "層次", outputHeaders: ["層次"], aliases: ["層次", "樓層"] },
      { id: "totalFloors", label: "總層數", outputHeaders: ["總層數"], aliases: ["總層數", "總樓層"] },
      { id: "structure", label: "構造", outputHeaders: ["構造"], aliases: ["構造", "構造種類"] },
      { id: "completionDate", label: "建築完成日期", outputHeaders: ["建築完成日期"], aliases: ["建築完成日期", "完工日期", "建築日期"] },
      { id: "address", label: "謄本地址", outputHeaders: ["謄本地址", "地址"], aliases: ["謄本地址", "地址", "通訊地址", "戶籍地址", "住址"] },
      { id: "otherRightsType", label: "他項權利種類", outputHeaders: ["他項權利種類"], aliases: ["他項權利種類", "他項權利"] },
      { id: "otherRightsHolder", label: "他項權利人", outputHeaders: ["他項權利人"], aliases: ["他項權利人"] },
      { id: "debtor", label: "債務人", outputHeaders: ["債務人"], aliases: ["債務人"] },
      { id: "obligor", label: "設定義務人", outputHeaders: ["設定義務人"], aliases: ["設定義務人", "義務人"] },
      { id: "note", label: "備註", outputHeaders: ["備註"], aliases: ["備註", "說明", "備考"] },
    ],
  },
};

export function normalizeRosterColumnText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[（）()［］\[\]【】{}]/g, "")
    .replace(/平方公尺|平方米/gi, "㎡")
    .replace(/m²/gi, "m2")
    .replace(/\s+/g, "")
    .trim();
}

function normalizeDisplayText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function hasNegativeKeyword(headerText, field) {
  return (field.negativeKeywords ?? [])
    .some((keyword) => headerText.includes(normalizeRosterColumnText(keyword)));
}

function scoreHeaderForField(headerText, field) {
  const normalizedHeader = normalizeRosterColumnText(headerText);
  if (!normalizedHeader || hasNegativeKeyword(normalizedHeader, field)) {
    return 0;
  }

  let bestScore = 0;
  (field.aliases ?? []).forEach((alias) => {
    const normalizedAlias = normalizeRosterColumnText(alias);
    if (!normalizedAlias) {
      return;
    }
    if (normalizedHeader === normalizedAlias) {
      bestScore = Math.max(bestScore, 100);
    } else if (normalizedHeader.endsWith(normalizedAlias)) {
      bestScore = Math.max(bestScore, 92);
    } else if (normalizedHeader.includes(normalizedAlias)) {
      bestScore = Math.max(bestScore, 82);
    } else if (normalizedAlias.includes(normalizedHeader) && normalizedHeader.length >= 2) {
      bestScore = Math.max(bestScore, 68);
    }
  });

  (field.weakAliases ?? []).forEach((alias) => {
    const normalizedAlias = normalizeRosterColumnText(alias);
    if (!normalizedAlias) {
      return;
    }
    if (normalizedHeader === normalizedAlias) {
      bestScore = Math.max(bestScore, 72);
    } else if (normalizedHeader.includes(normalizedAlias)) {
      bestScore = Math.max(bestScore, 58);
    }
  });

  return bestScore;
}

function getMaxColumnCount(rows) {
  return rows.reduce((max, row) => Math.max(max, row.values?.length ?? 0), 0);
}

function createColumnLabel(index) {
  let columnNumber = index + 1;
  let label = "";
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return label;
}

function buildHeaderDescriptors(rows, startIndex, endIndex) {
  const maxColumns = getMaxColumnCount(rows);
  const descriptors = [];

  for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
    const parts = [];
    for (let rowIndex = startIndex; rowIndex <= endIndex; rowIndex += 1) {
      const value = normalizeDisplayText(rows[rowIndex]?.values?.[columnIndex]);
      if (value && !parts.includes(value)) {
        parts.push(value);
      }
    }
    const label = parts.join(" / ");
    descriptors.push({
      columnIndex,
      columnLabel: createColumnLabel(columnIndex),
      label,
      optionLabel: label ? `${createColumnLabel(columnIndex)} 欄 - ${label}` : `${createColumnLabel(columnIndex)} 欄 - 未命名欄位`,
      parts,
    });
  }

  return descriptors;
}

function mapFieldsFromDescriptors(descriptors, sheetType) {
  const group = FIELD_GROUPS[sheetType];
  const usedColumns = new Set();
  const mapping = {};
  const fieldScores = {};
  const requiredIds = new Set(group.requiredFieldIds);
  const orderedFields = [
    ...group.fields.filter((field) => requiredIds.has(field.id)),
    ...group.fields.filter((field) => !requiredIds.has(field.id)),
  ];

  orderedFields.forEach((field) => {
    let best = { score: 0, descriptor: null };
    descriptors.forEach((descriptor) => {
      if (!descriptor.label || usedColumns.has(descriptor.columnIndex)) {
        return;
      }
      const score = scoreHeaderForField(descriptor.label, field);
      if (score > best.score) {
        best = { score, descriptor };
      }
    });

    if (best.descriptor && best.score >= MATCH_THRESHOLD) {
      mapping[field.id] = best.descriptor.columnIndex;
      fieldScores[field.id] = best.score;
      usedColumns.add(best.descriptor.columnIndex);
    }
  });

  return { mapping, fieldScores };
}

function calculateMappingCoverage(mapping, sheetType) {
  const group = FIELD_GROUPS[sheetType];
  const requiredMissing = getMissingRosterRequiredFields(mapping, sheetType);
  return {
    requiredMissing,
    requiredCoverage: group.requiredFieldIds.length
      ? (group.requiredFieldIds.length - requiredMissing.length) / group.requiredFieldIds.length
      : 1,
  };
}

function scoreHeaderBlock(rows, startIndex, endIndex, sheetType) {
  const descriptors = buildHeaderDescriptors(rows, startIndex, endIndex);
  const { mapping, fieldScores } = mapFieldsFromDescriptors(descriptors, sheetType);
  const coverage = calculateMappingCoverage(mapping, sheetType);
  const requiredScore = FIELD_GROUPS[sheetType].requiredFieldIds
    .reduce((total, fieldId) => total + (fieldScores[fieldId] ?? 0), 0);
  const optionalScore = Object.entries(fieldScores)
    .filter(([fieldId]) => !FIELD_GROUPS[sheetType].requiredFieldIds.includes(fieldId))
    .reduce((total, [, score]) => total + score, 0);

  return {
    startIndex,
    endIndex,
    dataStartIndex: endIndex + 1,
    descriptors,
    mapping,
    fieldScores,
    requiredMissing: coverage.requiredMissing,
    requiredCoverage: coverage.requiredCoverage,
    score: requiredScore + Math.min(optionalScore, 500) + coverage.requiredCoverage * 1000,
  };
}

export function detectRosterColumnMapping(rows, sheetType) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const scanLimit = Math.min(MAX_HEADER_SCAN_ROWS, normalizedRows.length);
  let best = null;

  for (let startIndex = 0; startIndex < scanLimit; startIndex += 1) {
    for (
      let endIndex = startIndex;
      endIndex < Math.min(normalizedRows.length, startIndex + MAX_HEADER_DEPTH);
      endIndex += 1
    ) {
      const candidate = scoreHeaderBlock(normalizedRows, startIndex, endIndex, sheetType);
      if (!best || candidate.score > best.score) {
        best = candidate;
      }
    }
  }

  const requiredScoreFieldIds = best?.mapping?.shareText !== undefined && best?.mapping?.shareText !== ""
    ? [
      ...FIELD_GROUPS[sheetType].requiredFieldIds.filter((fieldId) => !["shareNumerator", "shareDenominator"].includes(fieldId)),
      "shareText",
    ]
    : FIELD_GROUPS[sheetType].requiredFieldIds;
  const averageRequiredScore = requiredScoreFieldIds
    .reduce((total, fieldId) => total + (best?.fieldScores?.[fieldId] ?? 0), 0)
    / requiredScoreFieldIds.length;
  const requiredMissing = best?.requiredMissing ?? FIELD_GROUPS[sheetType].requiredFieldIds;

  return {
    sheetType,
    headerStartIndex: best?.startIndex ?? 0,
    headerEndIndex: best?.endIndex ?? 0,
    dataStartIndex: best?.dataStartIndex ?? 0,
    columns: best?.descriptors ?? [],
    mapping: best?.mapping ?? {},
    fieldScores: best?.fieldScores ?? {},
    requiredMissing,
    requiredCoverage: best?.requiredCoverage ?? 0,
    averageRequiredScore,
    confidence: best ? Math.round(((best.requiredCoverage * 0.75) + (Math.min(averageRequiredScore, 100) / 100 * 0.25)) * 100) / 100 : 0,
    needsManualMapping: requiredMissing.length > 0 || averageRequiredScore < STRONG_MATCH_THRESHOLD,
  };
}

function scoreSheetName(name, sheetType) {
  const normalizedName = normalizeRosterColumnText(name);
  return FIELD_GROUPS[sheetType].sheetKeywords
    .reduce((total, keyword) => total + (normalizedName.includes(normalizeRosterColumnText(keyword)) ? 250 : 0), 0);
}

export function analyzeRosterSheet(name, rows, sheetType) {
  const columnMapping = detectRosterColumnMapping(rows, sheetType);
  return {
    name,
    rows,
    sheetType,
    ...columnMapping,
    sheetScore: scoreSheetName(name, sheetType) + columnMapping.requiredCoverage * 1000 + columnMapping.confidence * 100,
  };
}

export function selectRosterSheets(sheetRowsByName) {
  const sheetEntries = Object.entries(sheetRowsByName ?? {});
  const analyses = {
    land: sheetEntries.map(([name, rows]) => analyzeRosterSheet(name, rows, "land")),
    building: sheetEntries.map(([name, rows]) => analyzeRosterSheet(name, rows, "building")),
  };
  const land = analyses.land.sort((left, right) => right.sheetScore - left.sheetScore)[0] ?? null;
  const building = analyses.building
    .filter((analysis) => analysis.name !== land?.name || analysis.requiredCoverage > land.requiredCoverage)
    .sort((left, right) => right.sheetScore - left.sheetScore)[0] ?? null;

  return {
    analyses,
    land: land && land.requiredCoverage > 0 ? land : null,
    building: building && building.requiredCoverage > 0 ? building : null,
  };
}

export function getRosterColumnFieldGroups() {
  return FIELD_GROUPS;
}

export function getRosterColumnFieldList(sheetType) {
  return FIELD_GROUPS[sheetType]?.fields ?? [];
}

export function getRosterColumnRequiredFieldIds(sheetType) {
  return FIELD_GROUPS[sheetType]?.requiredFieldIds ?? [];
}

export function getMissingRosterRequiredFields(mapping, sheetType) {
  const missing = (FIELD_GROUPS[sheetType]?.requiredFieldIds ?? [])
    .filter((fieldId) => mapping?.[fieldId] === undefined || mapping?.[fieldId] === "");

  if (mapping?.shareText !== undefined && mapping?.shareText !== "") {
    return missing.filter((fieldId) => !["shareNumerator", "shareDenominator"].includes(fieldId));
  }

  return missing;
}

function getField(sheetType, fieldId) {
  return FIELD_GROUPS[sheetType]?.fields.find((field) => field.id === fieldId);
}

function splitShareText(value) {
  const text = normalizeDisplayText(value);
  const match = text.match(/^([^/／]+)[/／]([^/／]+)$/);
  if (!match) {
    return { numerator: "", denominator: "" };
  }
  return {
    numerator: normalizeDisplayText(match[1]),
    denominator: normalizeDisplayText(match[2]),
  };
}

function assignMappedValue(target, sheetType, fieldId, value) {
  const field = getField(sheetType, fieldId);
  if (!field) {
    return;
  }
  const normalizedValue = normalizeDisplayText(value);
  field.outputHeaders.forEach((header) => {
    target[header] = normalizedValue;
  });
  target[fieldId] = normalizedValue;

  if (fieldId === "shareText") {
    const { numerator, denominator } = splitShareText(normalizedValue);
    if (numerator && !target.shareNumerator) {
      target.shareNumerator = numerator;
      target["持分分子"] = numerator;
    }
    if (denominator && !target.shareDenominator) {
      target.shareDenominator = denominator;
      target["持分分母"] = denominator;
    }
  }
}

function rowHasAnyValue(row) {
  return (row.values ?? []).some((value) => normalizeDisplayText(value));
}

function rowHasOwnershipSignal(mappedRow, sheetType) {
  const group = FIELD_GROUPS[sheetType];
  return group.ownershipSignalFieldIds.some((fieldId) => normalizeDisplayText(mappedRow[fieldId]));
}

export function applyRosterColumnMapping(sheetAnalysis, mappingOverride = null) {
  if (!sheetAnalysis) {
    return { rows: [], summary: null };
  }

  const sheetType = sheetAnalysis.sheetType;
  const mapping = Object.fromEntries(
    Object.entries(mappingOverride ?? sheetAnalysis.mapping ?? {})
      .filter(([, columnIndex]) => columnIndex !== "" && columnIndex !== undefined && columnIndex !== null)
      .map(([fieldId, columnIndex]) => [fieldId, Number(columnIndex)]),
  );
  const dataRows = (sheetAnalysis.rows ?? []).slice(sheetAnalysis.dataStartIndex ?? 0);
  const carryForward = {};
  const mappedRows = [];

  dataRows.forEach((row) => {
    if (!rowHasAnyValue(row)) {
      return;
    }

    const mappedRow = { __rowNumber: row.excelRowNumber };
    Object.entries(mapping).forEach(([fieldId, columnIndex]) => {
      assignMappedValue(mappedRow, sheetType, fieldId, row.values?.[columnIndex]);
    });

    FIELD_GROUPS[sheetType].carryForwardFieldIds.forEach((fieldId) => {
      if (normalizeDisplayText(mappedRow[fieldId])) {
        carryForward[fieldId] = mappedRow[fieldId];
        return;
      }
      if (normalizeDisplayText(carryForward[fieldId])) {
        assignMappedValue(mappedRow, sheetType, fieldId, carryForward[fieldId]);
      }
    });

    if (!rowHasOwnershipSignal(mappedRow, sheetType)) {
      return;
    }

    mappedRows.push(mappedRow);
  });

  return {
    rows: mappedRows,
    summary: buildColumnMappingSummary(sheetAnalysis, mapping),
  };
}

export function buildColumnMappingSummary(sheetAnalysis, mappingOverride = null) {
  if (!sheetAnalysis) {
    return null;
  }
  const mapping = mappingOverride ?? sheetAnalysis.mapping ?? {};
  const fieldList = getRosterColumnFieldList(sheetAnalysis.sheetType);
  const columnsByIndex = new Map((sheetAnalysis.columns ?? []).map((column) => [column.columnIndex, column]));
  const requiredMissing = getMissingRosterRequiredFields(mapping, sheetAnalysis.sheetType);

  return {
    sheetName: sheetAnalysis.name,
    sheetType: sheetAnalysis.sheetType,
    confidence: sheetAnalysis.confidence,
    needsManualMapping: requiredMissing.length > 0 || sheetAnalysis.needsManualMapping,
    requiredMissing,
    mappings: fieldList
      .filter((field) => mapping[field.id] !== undefined && mapping[field.id] !== "")
      .map((field) => {
        const column = columnsByIndex.get(Number(mapping[field.id]));
        return {
          fieldId: field.id,
          fieldLabel: field.label,
          columnIndex: Number(mapping[field.id]),
          columnLabel: column?.columnLabel ?? "",
          headerLabel: column?.label ?? "",
        };
      }),
  };
}

export function buildRosterWorkbookMappingResult(selection, mappingOverrides = {}) {
  const landResult = applyRosterColumnMapping(selection.land, mappingOverrides.land);
  const buildingResult = applyRosterColumnMapping(selection.building, mappingOverrides.building);
  const summaries = {
    land: landResult.summary,
    building: buildingResult.summary,
  };
  const warnings = [];

  if (!selection.land) {
    warnings.push("未找到可辨識的土地清冊工作表。");
  }
  if (selection.land && summaries.land?.requiredMissing?.length) {
    warnings.push("土地清冊尚有必要欄位未完成對應。");
  }
  if (selection.building && summaries.building?.requiredMissing?.length) {
    warnings.push("建物清冊尚有必要欄位未完成對應。");
  }

  return {
    landRows: landResult.rows,
    buildingRows: buildingResult.rows,
    columnMappingSummary: summaries,
    columnMappingWarnings: warnings,
    needsColumnMapping: Boolean(
      selection.land?.needsManualMapping
        || selection.building?.needsManualMapping
        || summaries.land?.requiredMissing?.length
        || summaries.building?.requiredMissing?.length,
    ),
  };
}
