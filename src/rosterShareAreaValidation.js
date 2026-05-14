import {
  INTERNAL_DECIMAL_DIGITS,
  parsePrecisionNumber,
  parseRatio,
  roundForStorage,
  sqmToPing,
} from "./evaluationPrecision.js";

export const SHARE_AREA_TOLERANCE_SQM = 0.05;

function normalizeText(value) {
  return String(value ?? "").trim();
}

function hasSharePart(value) {
  const text = normalizeText(value);
  return Boolean(text && text !== "/" && text !== "／");
}

function roundShareValue(value) {
  return Number.isFinite(value) ? roundForStorage(value, INTERNAL_DECIMAL_DIGITS) : null;
}

function isLikelySequenceValue(value, calculatedShareAreaSqm) {
  const parsedValue = parsePrecisionNumber(value);
  return Number.isFinite(parsedValue)
    && Number.isInteger(parsedValue)
    && parsedValue > 0
    && parsedValue <= 20
    && Number.isFinite(calculatedShareAreaSqm)
    && calculatedShareAreaSqm >= 10
    && Math.abs(parsedValue - calculatedShareAreaSqm) > SHARE_AREA_TOLERANCE_SQM;
}

export function evaluateLandShareArea({
  landAreaSqm,
  shareNumerator,
  shareDenominator,
  originalShareAreaSqm,
  existingShareAreaSqm,
}) {
  const parsedLandAreaSqm = parsePrecisionNumber(landAreaSqm);
  const parsedOriginalShareAreaSqm = parsePrecisionNumber(originalShareAreaSqm);
  const parsedExistingShareAreaSqm = parsePrecisionNumber(existingShareAreaSqm);
  const parsedShareRatio = parseRatio(shareNumerator, shareDenominator);
  const parsedDenominator = parsePrecisionNumber(shareDenominator);
  const canCalculate = Number.isFinite(parsedLandAreaSqm)
    && Number.isFinite(parsedShareRatio)
    && Number.isFinite(parsedDenominator)
    && parsedDenominator !== 0;
  const calculatedShareAreaSqm = canCalculate ? parsedLandAreaSqm * parsedShareRatio : null;
  const chosenShareAreaSqm = Number.isFinite(calculatedShareAreaSqm)
    ? calculatedShareAreaSqm
    : Number.isFinite(parsedOriginalShareAreaSqm)
      ? parsedOriginalShareAreaSqm
      : parsedExistingShareAreaSqm;
  const shareAreaPing = Number.isFinite(chosenShareAreaSqm) ? sqmToPing(chosenShareAreaSqm) : null;
  const comparedShareAreaSqm = Number.isFinite(parsedOriginalShareAreaSqm)
    ? parsedOriginalShareAreaSqm
    : parsedExistingShareAreaSqm;
  const differenceSqm = Number.isFinite(comparedShareAreaSqm) && Number.isFinite(calculatedShareAreaSqm)
    ? Math.abs(comparedShareAreaSqm - calculatedShareAreaSqm)
    : null;
  const messages = [];

  if (!hasSharePart(shareNumerator) || !hasSharePart(shareDenominator) || parsedDenominator === 0) {
    messages.push("權利範圍不足，無法驗算");
  }

  if (!Number.isFinite(parsedLandAreaSqm)) {
    messages.push("土地面積不足，無法驗算持分面積");
  }

  if (Number.isFinite(differenceSqm) && differenceSqm > SHARE_AREA_TOLERANCE_SQM) {
    messages.push("持分面積與權利範圍驗算不一致");
  }

  if (isLikelySequenceValue(originalShareAreaSqm, calculatedShareAreaSqm) || isLikelySequenceValue(existingShareAreaSqm, calculatedShareAreaSqm)) {
    messages.push("疑似欄位錯置");
  }

  const validationStatus = messages.length ? "持分面積需確認" : "持分面積檢核通過";

  return {
    shareRatio: roundShareValue(parsedShareRatio),
    originalShareAreaSqm: roundShareValue(parsedOriginalShareAreaSqm),
    calculatedShareAreaSqm: roundShareValue(calculatedShareAreaSqm),
    calculatedShareAreaPing: roundShareValue(Number.isFinite(calculatedShareAreaSqm) ? sqmToPing(calculatedShareAreaSqm) : null),
    shareAreaSqm: roundShareValue(chosenShareAreaSqm),
    shareAreaPing: roundShareValue(shareAreaPing),
    shareAreaSource: Number.isFinite(calculatedShareAreaSqm)
      ? "calculated"
      : Number.isFinite(parsedOriginalShareAreaSqm)
        ? "original"
        : Number.isFinite(parsedExistingShareAreaSqm)
          ? "existing"
          : "",
    shareAreaValidationStatus: validationStatus,
    shareAreaDifferenceSqm: roundShareValue(differenceSqm),
    shareAreaValidationMessages: messages,
    shareAreaCanCalculate: canCalculate,
    shareAreaWithinTolerance: Number.isFinite(differenceSqm) ? differenceSqm <= SHARE_AREA_TOLERANCE_SQM : false,
    shareAreaSuspectedColumnMisalignment: messages.includes("疑似欄位錯置"),
  };
}

export function buildShareAreaQualitySummary(landRows) {
  const rows = Array.isArray(landRows) ? landRows : [];
  return {
    completeShareRows: rows.filter((row) => hasSharePart(row.shareNumerator) && hasSharePart(row.shareDenominator)).length,
    verifiableShareAreaRows: rows.filter((row) => row.shareAreaCanCalculate || Number.isFinite(parsePrecisionNumber(row.calculatedShareAreaSqm))).length,
    consistentShareAreaRows: rows.filter((row) => row.shareAreaWithinTolerance || row.shareAreaValidationStatus === "持分面積檢核通過").length,
    shareAreaWarningRows: rows.filter((row) => Array.isArray(row.shareAreaValidationMessages) && row.shareAreaValidationMessages.length).length,
    missingShareDenominatorRows: rows.filter((row) => !hasSharePart(row.shareDenominator) || parsePrecisionNumber(row.shareDenominator) === 0).length,
    suspectedMisalignedShareAreaRows: rows.filter((row) => row.shareAreaSuspectedColumnMisalignment).length,
  };
}
