import {
  INTERNAL_DECIMAL_DIGITS,
  parsePrecisionNumber,
  roundRecordNumbers,
} from "./evaluationPrecision.js";

const MISSING_LAND_KEY_PART = "__missing__";
const LOCATION_PART_KEYS = ["city", "district", "section", "subsection"];
const LAND_IDENTITY_PART_KEYS = [...LOCATION_PART_KEYS, "lotNumber"];
const LAND_IDENTITY_PART_LABELS = {
  city: "縣市",
  district: "行政區",
  section: "段別",
  subsection: "小段",
  lotNumber: "地號",
};

function firstNormalizedValue(row, fields) {
  for (const field of fields) {
    const value = normalizeLandKeyPart(row?.[field]);
    if (value) {
      return value;
    }
  }

  return "";
}

function pickNumericValue(...values) {
  for (const value of values) {
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function parseLandNumber(value) {
  if (Number.isFinite(value)) {
    return value;
  }

  return parsePrecisionNumber(value);
}

export function normalizeLandKeyPart(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLandIdentityParts(row = {}) {
  return {
    city: firstNormalizedValue(row, ["city", "county", "縣市", "市縣"]),
    district: firstNormalizedValue(row, ["district", "town", "行政區", "鄉鎮市區", "區"]),
    section: firstNormalizedValue(row, ["section", "段別", "地段", "段名"]),
    subsection: firstNormalizedValue(row, ["subsection", "小段", "小段別"]),
    lotNumber: firstNormalizedValue(row, [
      "lotNumber",
      "landNumber",
      "parcelNumber",
      "relatedLandNumber",
      "地號",
      "土地地號",
      "地段地號",
      "對應地號",
    ]),
  };
}

export function buildLandIdentity(row = {}) {
  const parts = getLandIdentityParts(row);
  const missingParts = LAND_IDENTITY_PART_KEYS
    .filter((key) => !parts[key])
    .map((key) => LAND_IDENTITY_PART_LABELS[key]);
  const hasLotNumber = Boolean(parts.lotNumber);
  const hasAnyLocationScope = LOCATION_PART_KEYS.some((key) => Boolean(parts[key]));
  const key = hasLotNumber
    ? LAND_IDENTITY_PART_KEYS.map((key) => parts[key] || MISSING_LAND_KEY_PART).join("|")
    : "";

  return {
    key,
    parts,
    displayLabel: getLandDisplayLabelFromParts(parts),
    missingParts,
    hasFallbackRisk: hasLotNumber && !hasAnyLocationScope,
    hasPartialLocation: hasLotNumber && missingParts.length > 0,
  };
}

export function buildLandIdentityKey(row = {}) {
  return buildLandIdentity(row).key;
}

export function buildLotIdentityKey(row = {}) {
  return buildLandIdentityKey(row);
}

export function getLandDisplayLabel(row = {}) {
  return buildLandIdentity(row).displayLabel;
}

export function getLandDisplayLabelFromParts(parts = {}) {
  const locationParts = [
    parts.city,
    parts.district,
    parts.section,
    parts.subsection,
  ].filter(Boolean);
  const lotLabel = parts.lotNumber ? `${parts.lotNumber}地號` : "";
  const label = [...locationParts, lotLabel].filter(Boolean).join(" ");

  if (label) {
    return locationParts.length ? label : `${label}（定位不足）`;
  }

  return "未填地號";
}

export function compareLandIdentityRecords(left, right) {
  return getLandDisplayLabel(left).localeCompare(getLandDisplayLabel(right), "zh-Hant", {
    numeric: true,
    sensitivity: "base",
  });
}

export function withLandIdentity(row = {}) {
  const identity = buildLandIdentity(row);

  return {
    ...row,
    landIdentityKey: identity.key,
    lotIdentityKey: identity.key,
    landDisplayLabel: identity.displayLabel,
    landIdentityMissingParts: identity.missingParts,
    landIdentityFallback: identity.hasFallbackRisk,
  };
}

export function buildUniqueLandRows(landRows = []) {
  const landByIdentityKey = new Map();

  landRows.forEach((row) => {
    const rowWithIdentity = withLandIdentity(row);
    if (!rowWithIdentity.landIdentityKey || landByIdentityKey.has(rowWithIdentity.landIdentityKey)) {
      return;
    }

    landByIdentityKey.set(rowWithIdentity.landIdentityKey, rowWithIdentity);
  });

  return Array.from(landByIdentityKey.values()).sort(compareLandIdentityRecords);
}

export function buildAssessedCurrentValueSummaryFromLandRows(landRows = []) {
  const landByIdentityKey = new Map();
  const conflictLandLabels = new Set();
  const fallbackLandLabels = new Set();

  landRows.forEach((row) => {
    const identity = buildLandIdentity(row);
    if (!identity.key) {
      return;
    }

    const landAreaSqm = pickNumericValue(
      parseLandNumber(row.landAreaSqm),
      parseLandNumber(row.landAreaRaw),
      parseLandNumber(row.landArea),
    );
    const assessedCurrentValueUnit = parseLandNumber(row.announcedCurrentValue);
    const existing = landByIdentityKey.get(identity.key);

    if (identity.hasFallbackRisk) {
      fallbackLandLabels.add(identity.displayLabel);
    }

    if (existing) {
      const areaDiffers = Number.isFinite(existing.landAreaSqm)
        && Number.isFinite(landAreaSqm)
        && Math.abs(existing.landAreaSqm - landAreaSqm) > 0.000001;
      const unitDiffers = Number.isFinite(existing.assessedCurrentValueUnit)
        && Number.isFinite(assessedCurrentValueUnit)
        && Math.abs(existing.assessedCurrentValueUnit - assessedCurrentValueUnit) > 0.000001;

      if (areaDiffers || unitDiffers) {
        conflictLandLabels.add(identity.displayLabel);
      }
      if (!Number.isFinite(existing.landAreaSqm) && Number.isFinite(landAreaSqm)) {
        existing.landAreaSqm = landAreaSqm;
      }
      if (!Number.isFinite(existing.assessedCurrentValueUnit) && Number.isFinite(assessedCurrentValueUnit)) {
        existing.assessedCurrentValueUnit = assessedCurrentValueUnit;
      }
      return;
    }

    landByIdentityKey.set(identity.key, {
      landIdentityKey: identity.key,
      landDisplayLabel: identity.displayLabel,
      landNumber: identity.parts.lotNumber,
      lotNumber: identity.parts.lotNumber,
      city: identity.parts.city,
      district: identity.parts.district,
      section: identity.parts.section,
      subsection: identity.parts.subsection,
      landAreaSqm,
      assessedCurrentValueUnit,
      hasFallbackRisk: identity.hasFallbackRisk,
    });
  });

  const assessedCurrentValueByLot = Array.from(landByIdentityKey.values())
    .map((lot) => ({
      ...lot,
      assessedCurrentValueSubtotal: Number.isFinite(lot.landAreaSqm) && Number.isFinite(lot.assessedCurrentValueUnit)
        ? lot.landAreaSqm * lot.assessedCurrentValueUnit
        : null,
    }))
    .sort(compareLandIdentityRecords);
  const completeLotCount = assessedCurrentValueByLot.filter((lot) => (
    Number.isFinite(lot.landAreaSqm) && Number.isFinite(lot.assessedCurrentValueUnit)
  )).length;
  const providedLotCount = assessedCurrentValueByLot.filter((lot) => Number.isFinite(lot.assessedCurrentValueUnit)).length;
  const assessedCurrentValueTotal = completeLotCount
    ? assessedCurrentValueByLot.reduce((total, lot) => (
      total + (Number.isFinite(lot.assessedCurrentValueSubtotal) ? lot.assessedCurrentValueSubtotal : 0)
    ), 0)
    : null;
  const landAreaTotal = assessedCurrentValueByLot.reduce((total, lot) => (
    total + (Number.isFinite(lot.landAreaSqm) ? lot.landAreaSqm : 0)
  ), 0);
  const assessedCurrentValueWeightedUnit = Number.isFinite(assessedCurrentValueTotal) && landAreaTotal > 0
    ? assessedCurrentValueTotal / landAreaTotal
    : null;
  const assessedCurrentValueSourceStatus = (() => {
    if (!assessedCurrentValueByLot.length || !providedLotCount) {
      return "清冊未提供";
    }
    if (conflictLandLabels.size || fallbackLandLabels.size) {
      return "需人工確認";
    }
    if (completeLotCount !== assessedCurrentValueByLot.length) {
      return "部分地籍缺漏";
    }
    return `清冊已提供 ${completeLotCount} 筆地籍資料`;
  })();

  return roundRecordNumbers({
    assessedCurrentValueTotal,
    assessedCurrentValueWeightedUnit,
    assessedCurrentValueByLot,
    assessedCurrentValueSourceStatus,
    assessedCurrentValueConflictLabels: Array.from(conflictLandLabels),
    assessedCurrentValueFallbackLabels: Array.from(fallbackLandLabels),
  }, INTERNAL_DECIMAL_DIGITS);
}
