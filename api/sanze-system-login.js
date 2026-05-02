import {
  SESSION_MAX_AGE_SECONDS,
  createSessionCookie,
  getAuthConfig,
  hashPassword,
  isConfigReady,
  safeEqual,
  sendJson,
  signSession,
} from "./_sanze-system-auth.js";

async function readJsonBody(request) {
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

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { authenticated: false });
    return;
  }

  const config = getAuthConfig();
  if (!isConfigReady(config)) {
    sendJson(response, 503, { authenticated: false });
    return;
  }

  const { email = "", password = "" } = await readJsonBody(request);
  const normalizedEmail = String(email).trim().toLowerCase();
  const candidatePassword = String(password);
  const candidateHash = hashPassword(candidatePassword, config.passwordSalt);
  const isAllowedEmail = config.adminEmails.includes(normalizedEmail);
  const isValidPassword = safeEqual(candidateHash, config.passwordHash);

  if (!isAllowedEmail || !isValidPassword) {
    sendJson(response, 401, { authenticated: false });
    return;
  }

  const now = Date.now();
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  const token = signSession(
    {
      email: normalizedEmail,
      role: "admin",
      iat: now,
      exp: expiresAt,
    },
    config.authSecret,
  );

  sendJson(
    response,
    200,
    {
      authenticated: true,
      email: normalizedEmail,
      role: "admin",
      expiresAt,
    },
    {
      "Set-Cookie": createSessionCookie(token),
    },
  );
}
