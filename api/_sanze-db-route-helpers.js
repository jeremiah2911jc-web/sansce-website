import {
  SESSION_COOKIE_NAME,
  getAuthConfig,
  isConfigReady,
  parseCookies,
  sendJson,
  verifySession,
} from "./_sanze-system-auth.js";

import {
  DATABASE_SYNC_NOT_CONFIGURED_MESSAGE,
  createSupabaseAdminClient,
  getSupabaseAdminConfig,
  isSupabaseAdminConfigured,
} from "./_supabaseAdmin.js";

export async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export function requireSanzeSession(request, response) {
  const cookies = parseCookies(request.headers.cookie ?? "");
  if (!cookies[SESSION_COOKIE_NAME]) {
    sendJson(response, 401, {
      ok: false,
      code: "UNAUTHORIZED",
      message: "請先登入三策開發評估系統。",
    });
    return null;
  }

  const config = getAuthConfig();
  if (!isConfigReady(config)) {
    sendJson(response, 503, {
      ok: false,
      code: "AUTH_NOT_CONFIGURED",
      message: "三策測試授權尚未設定。",
    });
    return null;
  }

  const session = verifySession(cookies[SESSION_COOKIE_NAME], config.authSecret);

  if (!session) {
    sendJson(response, 401, {
      ok: false,
      code: "UNAUTHORIZED",
      message: "請先登入三策開發評估系統。",
    });
    return null;
  }

  return session;
}

export function requireSupabaseAdmin(response) {
  const config = getSupabaseAdminConfig();
  if (!isSupabaseAdminConfigured(config)) {
    sendJson(response, 503, {
      ok: false,
      code: "DB_SYNC_NOT_CONFIGURED",
      message: DATABASE_SYNC_NOT_CONFIGURED_MESSAGE,
    });
    return null;
  }

  return createSupabaseAdminClient(config);
}

export function isPlainRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function toNullableNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

export function toNullableInteger(value) {
  const numeric = toNullableNumber(value);
  return Number.isInteger(numeric) ? numeric : null;
}

export function toIsoTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function uniqueCount(rows, field) {
  return new Set(asArray(rows).map((row) => toText(row?.[field])).filter(Boolean)).size;
}

export function pickFirstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? null;
}
