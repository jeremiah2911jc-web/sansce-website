import {
  LICENSE_SERVICE_NOT_CONFIGURED_MESSAGE,
  createLicenseSupabaseClient,
  getLicenseServiceConfig,
  hashDeviceFingerprint,
  isLicenseServiceConfigured,
  jsonResponse,
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
  const { data: device, error: deviceError } = await supabase
    .from("license_devices")
    .select("*")
    .eq("id", tokenPayload.deviceId)
    .maybeSingle();

  if (deviceError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
    return;
  }

  if (!device || device.device_fingerprint_hash !== deviceFingerprintHash) {
    jsonResponse(response, 401, { ok: false, status: "license_error", message: "授權狀態無法驗證，請重新啟用。" });
    return;
  }

  const revokedAt = nowIso();
  const { error: updateError } = await supabase
    .from("license_devices")
    .update({
      status: "revoked",
      revoked_at: revokedAt,
      updated_at: revokedAt,
    })
    .eq("id", device.id);

  if (updateError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成停用。" });
    return;
  }

  await recordLicenseEvent(supabase, {
    licenseId: device.license_id,
    deviceId: device.id,
    eventType: "deactivate_device",
    metadata: {},
  });

  jsonResponse(response, 200, {
    ok: true,
    status: "revoked",
    message: "此裝置已停用。",
  });
}
