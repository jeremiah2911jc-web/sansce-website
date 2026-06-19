import {
  LICENSE_SERVICE_NOT_CONFIGURED_MESSAGE,
  buildLicenseTokenPayload,
  createLicenseSupabaseClient,
  getLicenseServiceConfig,
  hashDeviceFingerprint,
  hashLicenseKey,
  isExpiredLicense,
  isLicenseServiceConfigured,
  jsonResponse,
  nowIso,
  readJsonBody,
  recordLicenseEvent,
  signLicenseToken,
  toPlatform,
  toTrimmedString,
} from "../_license.js";

function invalidLicenseResponse(response) {
  jsonResponse(response, 401, {
    ok: false,
    status: "unauthorized",
    message: "授權碼無法驗證，請確認後再試。",
  });
}

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
  const licenseKey = toTrimmedString(body.licenseKey);
  const deviceFingerprint = toTrimmedString(body.deviceFingerprint);
  const deviceName = toTrimmedString(body.deviceName);
  const platform = toPlatform(body.platform);
  const appVersion = toTrimmedString(body.appVersion);
  const build = toTrimmedString(body.build);

  if (!licenseKey || !deviceFingerprint) {
    jsonResponse(response, 400, { ok: false, message: "授權碼與裝置資訊不可空白。" });
    return;
  }

  const supabase = createLicenseSupabaseClient(config);
  const licenseKeyHash = hashLicenseKey(licenseKey, config);
  const deviceFingerprintHash = hashDeviceFingerprint(deviceFingerprint, config);

  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key_hash", licenseKeyHash)
    .maybeSingle();

  if (licenseError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
    return;
  }

  if (!license) {
    await recordLicenseEvent(supabase, {
      eventType: "failed_activate",
      metadata: { reason: "license_not_found", platform, appVersion, build },
    });
    invalidLicenseResponse(response);
    return;
  }

  if (license.status !== "active") {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      eventType: "failed_activate",
      metadata: { reason: license.status, platform, appVersion, build },
    });
    jsonResponse(response, 403, { ok: false, status: license.status === "expired" ? "expired" : "revoked", message: "此授權目前無法使用。" });
    return;
  }

  if (isExpiredLicense(license)) {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      eventType: "expired",
      metadata: { platform, appVersion, build },
    });
    jsonResponse(response, 403, { ok: false, status: "expired", message: "授權已到期。" });
    return;
  }

  const { data: existingDevice, error: existingDeviceError } = await supabase
    .from("license_devices")
    .select("*")
    .eq("license_id", license.id)
    .eq("device_fingerprint_hash", deviceFingerprintHash)
    .maybeSingle();

  if (existingDeviceError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
    return;
  }

  if (existingDevice) {
    if (existingDevice.status !== "active") {
      await recordLicenseEvent(supabase, {
        licenseId: license.id,
        deviceId: existingDevice.id,
        eventType: "device_revoked",
        metadata: { platform, appVersion, build },
      });
      jsonResponse(response, 403, { ok: false, status: "revoked", message: "此裝置授權已停用。" });
      return;
    }

    const verifiedAt = nowIso();
    const { data: updatedDevice, error: updateError } = await supabase
      .from("license_devices")
      .update({
        device_name: deviceName || existingDevice.device_name,
        platform,
        app_version: appVersion,
        build,
        last_verified_at: verifiedAt,
        updated_at: verifiedAt,
      })
      .eq("id", existingDevice.id)
      .select("*")
      .single();

    if (updateError) {
      jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
      return;
    }

    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      deviceId: updatedDevice.id,
      eventType: "verify",
      metadata: { source: "activate_existing_device", platform, appVersion, build },
    });

    const tokenPayload = buildLicenseTokenPayload(license, updatedDevice);
    jsonResponse(response, 200, {
      ok: true,
      status: "online_authorized",
      licenseToken: signLicenseToken(tokenPayload, config),
      customerName: license.customer_name ?? "",
      plan: license.plan ?? "test",
      expiresAt: license.expires_at ?? null,
      maxDevices: license.max_devices,
      enabledFeatures: license.enabled_features ?? {},
    });
    return;
  }

  const { count: activeDeviceCount, error: countError } = await supabase
    .from("license_devices")
    .select("id", { count: "exact", head: true })
    .eq("license_id", license.id)
    .eq("status", "active");

  if (countError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
    return;
  }

  if ((activeDeviceCount ?? 0) >= license.max_devices) {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      eventType: "device_limit_exceeded",
      metadata: { platform, appVersion, build },
    });
    jsonResponse(response, 403, {
      ok: false,
      status: "device_limit_exceeded",
      message: "此授權已達裝置數上限。",
    });
    return;
  }

  const activatedAt = nowIso();
  const { data: device, error: insertDeviceError } = await supabase
    .from("license_devices")
    .insert({
      license_id: license.id,
      device_fingerprint_hash: deviceFingerprintHash,
      device_name: deviceName,
      platform,
      app_version: appVersion,
      build,
      status: "active",
      activated_at: activatedAt,
      last_verified_at: activatedAt,
      created_at: activatedAt,
      updated_at: activatedAt,
    })
    .select("*")
    .single();

  if (insertDeviceError) {
    jsonResponse(response, 500, { ok: false, status: "license_error", message: "授權服務暫時無法完成驗證。" });
    return;
  }

  await recordLicenseEvent(supabase, {
    licenseId: license.id,
    deviceId: device.id,
    eventType: "activate",
    metadata: { platform, appVersion, build },
  });

  const tokenPayload = buildLicenseTokenPayload(license, device);
  jsonResponse(response, 200, {
    ok: true,
    status: "online_authorized",
    licenseToken: signLicenseToken(tokenPayload, config),
    customerName: license.customer_name ?? "",
    plan: license.plan ?? "test",
    expiresAt: license.expires_at ?? null,
    maxDevices: license.max_devices,
    enabledFeatures: license.enabled_features ?? {},
  });
}
