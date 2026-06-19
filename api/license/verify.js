import {
  LICENSE_SERVICE_NOT_CONFIGURED_MESSAGE,
  createLicenseSupabaseClient,
  getLicenseServiceConfig,
  hashDeviceFingerprint,
  isExpiredLicense,
  isLicenseServiceConfigured,
  jsonResponse,
  mapLicenseStatusToAppStatus,
  nowIso,
  readJsonBody,
  recordLicenseEvent,
  toTrimmedString,
  verifyLicenseToken,
} from "../_license.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    jsonResponse(response, 405, { ok: false, message: "只接受 POST。" });
    return;
  }

  const config = getLicenseServiceConfig();
  if (!isLicenseServiceConfigured(config)) {
    jsonResponse(response, 503, { ok: false, status: "server_unreachable", message: LICENSE_SERVICE_NOT_CONFIGURED_MESSAGE });
    return;
  }

  const body = await readJsonBody(request);
  const licenseToken = toTrimmedString(body.licenseToken);
  const deviceFingerprint = toTrimmedString(body.deviceFingerprint);
  const appVersion = toTrimmedString(body.appVersion);
  const build = toTrimmedString(body.build);

  if (!licenseToken || !deviceFingerprint) {
    jsonResponse(response, 400, { ok: false, message: "授權 token 與裝置資訊不可空白。" });
    return;
  }

  const tokenPayload = verifyLicenseToken(licenseToken, config);
  if (!tokenPayload) {
    jsonResponse(response, 401, { ok: false, status: "license_error", message: "授權狀態無法驗證，請重新啟用。" });
    return;
  }

  const supabase = createLicenseSupabaseClient(config);
  const deviceFingerprintHash = hashDeviceFingerprint(deviceFingerprint, config);

  const [{ data: license, error: licenseError }, { data: device, error: deviceError }] = await Promise.all([
    supabase.from("licenses").select("*").eq("id", tokenPayload.licenseId).maybeSingle(),
    supabase.from("license_devices").select("*").eq("id", tokenPayload.deviceId).maybeSingle(),
  ]);

  if (licenseError || deviceError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
    return;
  }

  if (!license || !device || device.license_id !== license.id || device.device_fingerprint_hash !== deviceFingerprintHash) {
    jsonResponse(response, 401, { ok: false, status: "license_error", message: "授權狀態無法驗證，請重新啟用。" });
    return;
  }

  const status = mapLicenseStatusToAppStatus(license);
  if (status !== "online_authorized") {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      deviceId: device.id,
      eventType: status,
      metadata: { appVersion, build },
    });
    jsonResponse(response, status === "expired" ? 403 : 401, {
      ok: false,
      status,
      allowedMode: status,
      expiresAt: license.expires_at ?? null,
      serverTime: nowIso(),
      enabledFeatures: license.enabled_features ?? {},
      message: status === "expired" ? "授權已到期。" : "此授權目前無法使用。",
    });
    return;
  }

  if (isExpiredLicense(license)) {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      deviceId: device.id,
      eventType: "expired",
      metadata: { appVersion, build },
    });
    jsonResponse(response, 403, {
      ok: false,
      status: "expired",
      allowedMode: "expired",
      expiresAt: license.expires_at ?? null,
      serverTime: nowIso(),
      enabledFeatures: license.enabled_features ?? {},
      message: "授權已到期。",
    });
    return;
  }

  if (device.status !== "active") {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      deviceId: device.id,
      eventType: "device_revoked",
      metadata: { appVersion, build },
    });
    jsonResponse(response, 401, {
      ok: false,
      status: "revoked",
      allowedMode: "revoked",
      expiresAt: license.expires_at ?? null,
      serverTime: nowIso(),
      enabledFeatures: license.enabled_features ?? {},
      message: "此裝置授權已停用。",
    });
    return;
  }

  const verifiedAt = nowIso();
  await supabase
    .from("license_devices")
    .update({
      app_version: appVersion || device.app_version,
      build: build || device.build,
      last_verified_at: verifiedAt,
      updated_at: verifiedAt,
    })
    .eq("id", device.id);

  await recordLicenseEvent(supabase, {
    licenseId: license.id,
    deviceId: device.id,
    eventType: "verify",
    metadata: { appVersion, build },
  });

  jsonResponse(response, 200, {
    ok: true,
    status: "online_authorized",
    allowedMode: "online_authorized",
    expiresAt: license.expires_at ?? null,
    serverTime: nowIso(),
    enabledFeatures: license.enabled_features ?? {},
  });
}
