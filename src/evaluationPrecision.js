export const SQM_PER_PING = 3.305785;
export const SHARE_TOTAL_TOLERANCE = 0.0001;
export const INTERNAL_DECIMAL_DIGITS = 6;
export const STORAGE_DECIMAL_DIGITS = 4;

export function parsePrecisionNumber(value) {
  const normalizedValue = String(value ?? "").replace(/,/g, "").trim();
  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function roundForStorage(value, digits = STORAGE_DECIMAL_DIGITS) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function roundRecordNumbers(value, digits = STORAGE_DECIMAL_DIGITS) {
  if (Array.isArray(value)) {
    return value.map((item) => roundRecordNumbers(item, digits));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, roundRecordNumbers(item, digits)]),
    );
  }

  return Number.isFinite(value) ? roundForStorage(value, digits) : value;
}

export function sqmToPing(value) {
  return Number.isFinite(value) ? value / SQM_PER_PING : null;
}

export function pingToSqm(value) {
  return Number.isFinite(value) ? value * SQM_PER_PING : null;
}

export function parseRatio(numerator, denominator) {
  const parsedNumerator = parsePrecisionNumber(numerator);
  const parsedDenominator = parsePrecisionNumber(denominator);

  if (!Number.isFinite(parsedNumerator) || !Number.isFinite(parsedDenominator) || parsedDenominator === 0) {
    return null;
  }

  return parsedNumerator / parsedDenominator;
}

export function formatNumber(value, digits = 2, options = {}) {
  if (!Number.isFinite(value)) {
    return "待補資料";
  }

  return value.toLocaleString("zh-TW", {
    maximumFractionDigits: digits,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  });
}

export function formatAreaSqm(value) {
  return Number.isFinite(value)
    ? `${formatNumber(value, 2, { minimumFractionDigits: 2 })} 平方公尺`
    : "待補資料";
}

export function formatAreaPing(value) {
  return Number.isFinite(value)
    ? `${formatNumber(value, 2, { minimumFractionDigits: 2 })} 坪`
    : "待補資料";
}
