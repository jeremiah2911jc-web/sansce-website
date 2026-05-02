import {
  SESSION_COOKIE_NAME,
  getAuthConfig,
  isConfigReady,
  parseCookies,
  sendJson,
  verifySession,
} from "./_sanze-system-auth.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { authenticated: false });
    return;
  }

  const config = getAuthConfig();
  if (!isConfigReady(config)) {
    sendJson(response, 200, { authenticated: false });
    return;
  }

  const cookies = parseCookies(request.headers.cookie ?? "");
  const session = verifySession(cookies[SESSION_COOKIE_NAME], config.authSecret);

  if (!session) {
    sendJson(response, 200, { authenticated: false });
    return;
  }

  sendJson(response, 200, {
    authenticated: true,
    email: session.email,
    role: session.role ?? "admin",
    expiresAt: session.exp,
  });
}
