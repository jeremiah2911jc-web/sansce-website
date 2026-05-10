import { lookup } from "node:dns/promises";

import { sendJson } from "./_sanze-system-auth.js";
import { requireSanzeSession } from "./_sanze-db-route-helpers.js";
import { getSupabaseAdminConfig } from "./_supabaseAdmin.js";

function hasWhitespace(value) {
  return /\s/.test(value);
}

function getSupabaseHost(rawUrl) {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return "";
  }

  try {
    return new URL(trimmedUrl).host;
  } catch {
    return "";
  }
}

function looksLikeJwt(value) {
  return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim());
}

function serviceRoleLooksLikeSecret(value) {
  const trimmedValue = value.trim();
  return Boolean(trimmedValue && (trimmedValue.startsWith("sb_secret_") || looksLikeJwt(trimmedValue)));
}

function sanitizeDnsErrorMessage(error) {
  if (!error?.message) {
    return "";
  }

  return String(error.message)
    .replace(/\s+/g, " ")
    .replace(/https?:\/\/[^\s,;]+/gi, "[redacted-url]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-token]")
    .replace(/\b(service_role|anon|apikey|authorization|bearer)(\s*[:=]\s*)([^\s,;]+)/gi, "$1$2[redacted]")
    .trim()
    .slice(0, 300);
}

async function checkDnsLookup(host) {
  if (!host) {
    return {
      ok: false,
      errorCode: "NO_HOST",
      errorMessage: "Supabase URL host is missing or invalid.",
    };
  }

  try {
    await lookup(host);
    return {
      ok: true,
      errorCode: "",
      errorMessage: "",
    };
  } catch (error) {
    return {
      ok: false,
      errorCode: typeof error?.code === "string" ? error.code : "DNS_LOOKUP_FAILED",
      errorMessage: sanitizeDnsErrorMessage(error),
    };
  }
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { ok: false, message: "只接受 GET。" });
    return;
  }

  const session = requireSanzeSession(request, response);
  if (!session) {
    return;
  }

  const { url, serviceRoleKey } = getSupabaseAdminConfig();
  const supabaseUrlHost = getSupabaseHost(url);
  const dnsLookup = await checkDnsLookup(supabaseUrlHost);

  sendJson(response, 200, {
    ok: true,
    supabaseUrlPresent: Boolean(url),
    supabaseUrlHost,
    supabaseUrlStartsWithHttps: url.trim().startsWith("https://"),
    supabaseUrlHasWhitespace: hasWhitespace(url),
    supabaseUrlLength: url.length,
    serviceRolePresent: Boolean(serviceRoleKey),
    serviceRoleLooksLikeSecret: serviceRoleLooksLikeSecret(serviceRoleKey),
    dnsLookup,
    timestamp: new Date().toISOString(),
  });
}
