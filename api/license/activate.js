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

function logLicenseDiagnostic(stage, details = {}) {
  console.error("[license.activate]", JSON.stringify({
    stage,
    ...details,
  }));
}

function buildSupabaseErrorDetails(error, table, operation) {
  return {
    table,
    operation,
    supabaseCode: error?.code ?? "",
    supabaseMessage: error?.message ?? "",
    supabaseDetails: error?.details ?? "",
    supabaseHint: error?.hint ?? "",
  };
}

function licenseStorageErrorResponse(response) {
  jsonResponse(response, 500, {
    ok: false,
    status: "license_error",
    errorCode: "LICENSE_ACTIVATE_STORAGE_ERROR",
    message: "授權服務暫時無法完成驗證。",
  });
}

function unexpectedLicenseErrorResponse(response) {
  jsonResponse(response, 500, {
    ok: false,
    status: "license_error",
    errorCode: "LICENSE_ACTIVATE_UNEXPECTED",
    message: "授權服務暫時無法完成驗證。",
  });
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  try {
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
  const licenseKeyHashPrefix = licenseKeyHash.slice(0, 8);
  const deviceFingerprintHashPrefix = deviceFingerprintHash.slice(0, 8);

  let licenseResult;
  try {
    licenseResult = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key_hash", licenseKeyHash)
      .maybeSingle();
  } catch (error) {
    logLicenseDiagnostic("select_license_threw", {
      table: "licenses",
      operation: "select",
      licenseKeyHashPrefix,
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
    unexpectedLicenseErrorResponse(response);
    return;
  }

  const { data: license, error: licenseError } = licenseResult;
  if (licenseError) {
    logLicenseDiagnostic("select_license_failed", buildSupabaseErrorDetails(licenseError, "licenses", "select"));
    licenseStorageErrorResponse(response);
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

  let existingDeviceResult;
  try {
    existingDeviceResult = await supabase
      .from("license_devices")
      .select("*")
      .eq("license_id", license.id)
      .eq("device_fingerprint_hash", deviceFingerprintHash)
      .maybeSingle();
  } catch (error) {
    logLicenseDiagnostic("select_device_threw", {
      table: "license_devices",
      operation: "select",
      licenseId: license.id,
      deviceFingerprintHashPrefix,
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
    unexpectedLicenseErrorResponse(response);
    return;
  }

  const { data: existingDevice, error: existingDeviceError } = existingDeviceResult;
  if (existingDeviceError) {
    logLicenseDiagnostic("select_device_failed", buildSupabaseErrorDetails(existingDeviceError, "license_devices", "select"));
    licenseStorageErrorResponse(response);
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
    let updateResult;
    try {
      updateResult = await supabase
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
    } catch (error) {
      logLicenseDiagnostic("update_device_threw", {
        table: "license_devices",
        operation: "update",
        licenseId: license.id,
        deviceId: existingDevice.id,
        errorName: error?.name ?? "",
        errorMessage: error?.message ?? "",
      });
      unexpectedLicenseErrorResponse(response);
      return;
    }

    const { data: updatedDevice, error: updateError } = updateResult;
    if (updateError) {
      logLicenseDiagnostic("update_device_failed", buildSupabaseErrorDetails(updateError, "license_devices", "update"));
      licenseStorageErrorResponse(response);
      return;
    }

    try {
      await recordLicenseEvent(supabase, {
        licenseId: license.id,
        deviceId: updatedDevice.id,
        eventType: "verify",
        metadata: { source: "activate_existing_device", platform, appVersion, build },
      });
    } catch (error) {
      logLicenseDiagnostic("insert_event_threw", {
        table: "license_events",
        operation: "insert",
        licenseId: license.id,
        deviceId: updatedDevice.id,
        eventType: "verify",
        errorName: error?.name ?? "",
        errorMessage: error?.message ?? "",
      });
    }

    const tokenPayload = buildLicenseTokenPayload(license, updatedDevice);
    let licenseToken;
    try {
      licenseToken = signLicenseToken(tokenPayload, config);
    } catch (error) {
      logLicenseDiagnostic("sign_token_failed", {
        licenseId: license.id,
        deviceId: updatedDevice.id,
        errorName: error?.name ?? "",
        errorMessage: error?.message ?? "",
      });
      unexpectedLicenseErrorResponse(response);
      return;
    }

    jsonResponse(response, 200, {
      ok: true,
      status: "online_authorized",
      licenseToken,
      customerName: license.customer_name ?? "",
      plan: license.plan ?? "test",
      expiresAt: license.expires_at ?? null,
      maxDevices: license.max_devices,
      enabledFeatures: license.enabled_features ?? {},
    });
    return;
  }

  let countResult;
  try {
    countResult = await supabase
      .from("license_devices")
      .select("id", { count: "exact", head: true })
      .eq("license_id", license.id)
      .eq("status", "active");
  } catch (error) {
    logLicenseDiagnostic("count_devices_threw", {
      table: "license_devices",
      operation: "count",
      licenseId: license.id,
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
    unexpectedLicenseErrorResponse(response);
    return;
  }

  const { count: activeDeviceCount, error: countError } = countResult;
  if (countError) {
    logLicenseDiagnostic("count_devices_failed", buildSupabaseErrorDetails(countError, "license_devices", "count"));
    licenseStorageErrorResponse(response);
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
  let insertDeviceResult;
  try {
    insertDeviceResult = await supabase
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
  } catch (error) {
    logLicenseDiagnostic("insert_device_threw", {
      table: "license_devices",
      operation: "insert",
      licenseId: license.id,
      deviceFingerprintHashPrefix,
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
    unexpectedLicenseErrorResponse(response);
    return;
  }

  const { data: device, error: insertDeviceError } = insertDeviceResult;
  if (insertDeviceError) {
    logLicenseDiagnostic("insert_device_failed", buildSupabaseErrorDetails(insertDeviceError, "license_devices", "insert"));
    licenseStorageErrorResponse(response);
    return;
  }

  try {
    await recordLicenseEvent(supabase, {
      licenseId: license.id,
      deviceId: device.id,
      eventType: "activate",
      metadata: { platform, appVersion, build },
    });
  } catch (error) {
    logLicenseDiagnostic("insert_event_threw", {
      table: "license_events",
      operation: "insert",
      licenseId: license.id,
      deviceId: device.id,
      eventType: "activate",
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
  }

  const tokenPayload = buildLicenseTokenPayload(license, device);
  let licenseToken;
  try {
    licenseToken = signLicenseToken(tokenPayload, config);
  } catch (error) {
    logLicenseDiagnostic("sign_token_failed", {
      licenseId: license.id,
      deviceId: device.id,
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
    unexpectedLicenseErrorResponse(response);
    return;
  }

  jsonResponse(response, 200, {
    ok: true,
    status: "online_authorized",
    licenseToken,
    customerName: license.customer_name ?? "",
    plan: license.plan ?? "test",
    expiresAt: license.expires_at ?? null,
    maxDevices: license.max_devices,
    enabledFeatures: license.enabled_features ?? {},
  });
  } catch (error) {
    logLicenseDiagnostic("unexpected_activate_error", {
      errorName: error?.name ?? "",
      errorMessage: error?.message ?? "",
    });
    unexpectedLicenseErrorResponse(response);
  }
}
