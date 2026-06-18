import { safeEqual, sendJson } from "./_sanze-system-auth.js";

const DOWNLOADS = {
  macos: {
    platform: "macos",
    fileName: "Sanze-App-macOS-Test-0.1.0-arm64.zip",
    downloadUrl: "/downloads/Sanze-App-macOS-Test-0.1.0-arm64.zip",
  },
  windows: {
    platform: "windows",
    fileName: "Sanze-App-Windows-Test-0.1.0-x64-setup.exe",
    downloadUrl: "/downloads/Sanze-App-Windows-Test-0.1.0-x64-setup.exe",
  },
};

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

function isPasswordValid(candidatePassword, expectedPassword) {
  if (!candidatePassword || !expectedPassword) {
    return false;
  }

  return safeEqual(candidatePassword, expectedPassword);
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, message: "只接受 POST。" });
    return;
  }

  const expectedPassword = process.env.DESKTOP_DOWNLOAD_PASSWORD ?? "";
  if (!expectedPassword) {
    sendJson(response, 503, { ok: false, message: "下載服務尚未設定。" });
    return;
  }

  const body = await readJsonBody(request);
  const platform = typeof body.platform === "string" ? body.platform.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const download = DOWNLOADS[platform];

  if (!download) {
    sendJson(response, 400, { ok: false, message: "下載平台不正確。" });
    return;
  }

  if (!isPasswordValid(password, expectedPassword)) {
    sendJson(response, 401, { ok: false, message: "密碼錯誤，請確認後再試。" });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    ...download,
  });
}
