import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// First-stage test gate only. Configure these in Vercel Environment Variables:
// SANZE_SYSTEM_ADMIN_EMAILS, SANZE_SYSTEM_ADMIN_PASSWORD_HASH,
// SANZE_SYSTEM_PASSWORD_SALT, SANZE_SYSTEM_AUTH_SECRET.
// Never commit plaintext passwords, salts, hashes, or production secrets.
export const SESSION_COOKIE_NAME = "sanze_system_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password, salt) {
  return createHash("sha256").update(`${salt}:${password}`, "utf8").digest("hex");
}

export function getAuthConfig() {
  const adminEmails = (process.env.SANZE_SYSTEM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return {
    adminEmails,
    passwordHash: process.env.SANZE_SYSTEM_ADMIN_PASSWORD_HASH ?? "",
    passwordSalt: process.env.SANZE_SYSTEM_PASSWORD_SALT ?? "",
    authSecret: process.env.SANZE_SYSTEM_AUTH_SECRET ?? "",
  };
}

export function isConfigReady(config) {
  return Boolean(config.adminEmails.length && config.passwordHash && config.passwordSalt && config.authSecret);
}

export function signSession(payload, secret) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(body).digest("base64url");

  return `${body}.${signature}`;
}

export function verifySession(token, secret) {
  if (!token || !secret || !token.includes(".")) {
    return null;
  }

  const [body, signature] = token.split(".");
  const expectedSignature = createHmac("sha256", secret).update(body).digest("base64url");

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf("=");
        const name = separator >= 0 ? cookie.slice(0, separator) : cookie;
        const value = separator >= 0 ? cookie.slice(separator + 1) : "";
        return [name, decodeURIComponent(value)];
      }),
  );
}

export function createSessionCookie(token) {
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
}

export function sendJson(response, statusCode, body, headers = {}) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  Object.entries(headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  response.end(JSON.stringify(body));
}
