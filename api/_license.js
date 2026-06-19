import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "./_supabaseAdmin.js";

export const LICENSE_SERVICE_NOT_CONFIGURED_MESSAGE = "授權服務尚未設定。";

export function getLicenseServiceConfig() {
  return {
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    tokenSecret: process.env.LICENSE_TOKEN_SECRET ?? "",
    licenseKeyPepper: process.env.LICENSE_KEY_PEPPER ?? "",
  };
}

export function isLicenseServiceConfigured(config = getLicenseServiceConfig()) {
  return Boolean(
    config.tokenSecret
      && config.licenseKeyPepper
      && isSupabaseAdminConfigured({
        url: config.supabaseUrl,
        serviceRoleKey: config.serviceRoleKey,
      }),
  );
}

export function createLicenseSupabaseClient(config = getLicenseServiceConfig()) {
  if (!isLicenseServiceConfigured(config)) {
    return null;
  }

  return createSupabaseAdminClient({
    url: config.supabaseUrl,
    serviceRoleKey: config.serviceRoleKey,
  });
}

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

export function jsonResponse(response, status, body, headers = {}) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  Object.entries(headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
  response.end(JSON.stringify(body));
}

export function normalizeLicenseKey(licenseKey) {
  return typeof licenseKey === "string"
    ? licenseKey.trim().replace(/\s+/g, "").toUpperCase()
    : "";
}

export function hashLicenseKey(licenseKey, config = getLicenseServiceConfig()) {
  const normalized = normalizeLicenseKey(licenseKey);
  return createHash("sha256")
    .update(`${config.licenseKeyPepper}:license:${normalized}`, "utf8")
    .digest("hex");
}

export function hashDeviceFingerprint(deviceFingerprint, config = getLicenseServiceConfig()) {
  const normalized = typeof deviceFingerprint === "string" ? deviceFingerprint.trim() : "";
  return createHash("sha256")
    .update(`${config.licenseKeyPepper}:device:${normalized}`, "utf8")
    .digest("hex");
}

export function nowIso() {
  return new Date().toISOString();
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function signLicenseToken(payload, config = getLicenseServiceConfig()) {
  const body = base64UrlJson(payload);
  const signature = createHmac("sha256", config.tokenSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyLicenseToken(token, config = getLicenseServiceConfig()) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", config.tokenSecret).update(body).digest("base64url");
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!payload?.licenseId || !payload?.deviceId) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isExpiredLicense(license) {
  if (!license?.expires_at) {
    return false;
  }
  const expiresAt = new Date(license.expires_at);
  return Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
}

export function mapLicenseStatusToAppStatus(license) {
  if (!license) return "license_error";
  if (isExpiredLicense(license) || license.status === "expired") return "expired";
  if (license.status === "revoked" || license.status === "suspended") return "revoked";
  if (license.status !== "active") return "license_error";
  return "online_authorized";
}

export function buildLicenseTokenPayload(license, device) {
  return {
    licenseId: license.id,
    deviceId: device.id,
    licenseStatus: mapLicenseStatusToAppStatus(license),
    customerName: license.customer_name ?? "",
    plan: license.plan ?? "test",
    expiresAt: license.expires_at ?? null,
    enabledFeatures: license.enabled_features ?? {},
    issuedAt: nowIso(),
  };
}

export async function recordLicenseEvent(supabase, { licenseId = null, deviceId = null, eventType, metadata = {} }) {
  if (!supabase || !eventType) {
    return;
  }

  await supabase.from("license_events").insert({
    license_id: licenseId,
    device_id: deviceId,
    event_type: eventType,
    metadata,
  });
}

export function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function toPlatform(value) {
  const normalized = toTrimmedString(value).toLowerCase();
  if (normalized === "macos" || normalized === "windows") {
    return normalized;
  }
  return "unknown";
}
