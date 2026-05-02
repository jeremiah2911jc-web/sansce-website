import { clearSessionCookie, sendJson } from "./_sanze-system-auth.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false });
    return;
  }

  sendJson(
    response,
    200,
    { ok: true },
    {
      "Set-Cookie": clearSessionCookie(),
    },
  );
}
