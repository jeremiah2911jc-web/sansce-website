import { sendJson } from "./_sanze-system-auth.js";
import {
  asArray,
  isPlainRecord,
  pickFirstValue,
  readJsonBody,
  requireSanzeSession,
  requireSupabaseAdmin,
  toIsoTimestamp,
  toNullableInteger,
  toNullableNumber,
  toText,
  uniqueCount,
} from "./_sanze-db-route-helpers.js";

function asJsonRecord(value) {
  return isPlainRecord(value) ? value : {};
}

const DB_SYNC_FAILED_CODE = "DB_SYNC_FAILED";
const DB_SYNC_FAILED_MESSAGE = "資料庫同步失敗，目前仍使用本機測試資料。";
const MAX_DEBUG_FIELD_LENGTH = 500;

function markSyncStep(context, step) {
  context.step = step;
}

function sanitizeDebugText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  let sanitized = String(value)
    .replace(/\s+/g, " ")
    .replace(/https?:\/\/[^\s,;]+/gi, "[redacted-url]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-token]")
    .replace(/\b(service_role|anon|apikey|authorization|bearer)(\s*[:=]\s*)([^\s,;]+)/gi, "$1$2[redacted]")
    .replace(/\b(ownerName|owner_name|address|locationText|location_text)(\s*[:=]\s*)([^,;}]+)/gi, "$1$2[redacted]")
    .trim();

  if (/failing row contains/i.test(sanitized)) {
    sanitized = sanitized.replace(/failing row contains.*$/i, "Failing row contains [redacted-row].");
  }

  return sanitized.slice(0, MAX_DEBUG_FIELD_LENGTH);
}

function buildSanitizedSupabaseDebug(error) {
  const debug = {
    supabaseCode: sanitizeDebugText(error?.code),
    supabaseMessage: sanitizeDebugText(error?.message),
    supabaseDetails: sanitizeDebugText(error?.details),
    supabaseHint: sanitizeDebugText(error?.hint),
  };

  return Object.fromEntries(Object.entries(debug).filter(([, value]) => value));
}

function throwStepError(error, step) {
  if (error && typeof error === "object") {
    try {
      error.syncStep ||= step;
    } catch {
      // Keep the original error if it cannot be annotated.
    }
    throw error;
  }

  const wrapped = new Error(sanitizeDebugText(error) || "Unknown database sync error");
  wrapped.syncStep = step;
  throw wrapped;
}

async function runSyncStep(context, step, operation) {
  markSyncStep(context, step);

  try {
    return await operation();
  } catch (error) {
    throwStepError(error, step);
  }
}

function normalizeCasePayload(caseItem) {
  const rawCase = isPlainRecord(caseItem) ? caseItem : {};
  const localCaseId = toText(rawCase.id) || toText(rawCase.caseId) || toText(rawCase.local_case_id);
  const explicitCaseCode = toText(rawCase.code) || toText(rawCase.case_code);
  const caseCode = explicitCaseCode || localCaseId;

  return {
    localCaseId,
    caseCode,
    row: {
      case_code: caseCode,
      case_name: toText(rawCase.name) || toText(rawCase.case_name) || "未命名案件",
      development_path: toText(rawCase.path) || toText(rawCase.development_path),
      case_status: toText(rawCase.status) || toText(rawCase.case_status),
      consultant_name: toText(rawCase.consultant) || toText(rawCase.consultant_name),
      last_updated_label: toText(rawCase.updated) || toText(rawCase.last_updated_label),
      version_note: toText(rawCase.note) || toText(rawCase.version_note),
      updated_at: new Date().toISOString(),
      raw_json: {
        ...rawCase,
        local_case_id: localCaseId,
      },
    },
  };
}

function getRosterLandRows(rosterStaging) {
  return asArray(rosterStaging?.landRows).length
    ? asArray(rosterStaging.landRows)
    : asArray(rosterStaging?.landRights);
}

function getRosterBuildingRows(rosterStaging) {
  return asArray(rosterStaging?.buildingRows).length
    ? asArray(rosterStaging.buildingRows)
    : asArray(rosterStaging?.buildingRights);
}

function getRosterPartyGroups(rosterStaging) {
  return asArray(rosterStaging?.pgGroups).length
    ? asArray(rosterStaging.pgGroups)
    : asArray(rosterStaging?.partyGroups);
}

function normalizeRosterPayload(caseId, rosterStaging) {
  const roster = isPlainRecord(rosterStaging) ? rosterStaging : {};
  const landRows = getRosterLandRows(roster);
  const buildingRows = getRosterBuildingRows(roster);
  const importedAt = toIsoTimestamp(roster.importedAt || roster.imported_at);
  const updatedAt = toIsoTimestamp(roster.updatedAt || roster.updated_at);
  const row = {
    case_id: caseId,
    source_type: toText(roster.sourceType) || toText(roster.sourceFlow),
    source_filename: toText(roster.sourceFilename) || toText(roster.fileName),
    updated_at: updatedAt || new Date().toISOString(),
    land_rows: landRows,
    building_rows: buildingRows,
    pg_groups: getRosterPartyGroups(roster),
    summary_json: asJsonRecord(roster.summary),
    version_history: asArray(roster.versionHistory || roster.version_history),
    price_update_history: asArray(roster.priceUpdateHistory || roster.price_update_history),
  };

  if (importedAt) {
    row.imported_at = importedAt;
  }

  return row;
}

function normalizeBaseInfoPayload(caseId, baseInfo, rosterStaging) {
  const base = isPlainRecord(baseInfo) ? baseInfo : {};
  const roster = isPlainRecord(rosterStaging) ? rosterStaging : {};
  const summary = asJsonRecord(roster.summary);
  const landRows = getRosterLandRows(roster);
  const buildingRows = getRosterBuildingRows(roster);

  return {
    case_id: caseId,
    city: toText(base.city) || toText(summary.city),
    district: toText(base.district) || toText(summary.district),
    section: toText(base.section) || toText(base.landSection) || toText(summary.section),
    subsection: toText(base.subsection) || toText(summary.subsection),
    lot_count: toNullableInteger(pickFirstValue(base.lotCount, summary.lotCount, summary.landNumberCount)) ?? uniqueCount(landRows, "landNumber"),
    land_right_count: toNullableInteger(pickFirstValue(base.landRightCount, summary.landRightCount, summary.landCount)) ?? landRows.length,
    building_right_count: toNullableInteger(pickFirstValue(base.buildingRightCount, summary.buildingRightCount, summary.buildingCount)) ?? buildingRows.length,
    land_area_sqm: toNullableNumber(pickFirstValue(base.landAreaSqm, summary.landAreaSqm)),
    land_area_ping: toNullableNumber(pickFirstValue(base.landAreaPing, summary.landAreaPing)),
    announced_current_value_total: toNullableNumber(pickFirstValue(
      base.announcedCurrentValueTotal,
      summary.announcedCurrentValueTotal,
      summary.assessedCurrentValueTotal,
    )),
    announced_current_value_weighted_unit: toNullableNumber(pickFirstValue(
      base.announcedCurrentValueWeightedUnit,
      summary.announcedCurrentValueWeightedUnit,
      summary.assessedCurrentValueWeightedUnit,
    )),
    announced_current_value_year: toText(base.announcedCurrentValueYear) || toText(summary.announcedCurrentValueYear),
    declared_land_value_year: toText(base.declaredLandValueYear) || toText(summary.declaredLandValueYear),
    base_info_json: base,
    updated_at: new Date().toISOString(),
  };
}

function normalizeCapacityPayload(caseId, capacityInputs, capacityResults) {
  const inputs = asJsonRecord(capacityInputs);
  const results = asJsonRecord(capacityResults);

  return {
    case_id: caseId,
    inputs_json: inputs,
    results_json: results,
    tdr_scoring_json: asJsonRecord(inputs.tdrScoring),
    tdr_scoring_summary_json: asJsonRecord(results.tdrScoringSummary),
    updated_at: new Date().toISOString(),
  };
}

function normalizeFloorEfficiencyPayload(caseId, floorEfficiencyParams, floorEfficiencyResults) {
  return {
    case_id: caseId,
    params_json: asJsonRecord(floorEfficiencyParams),
    results_json: asJsonRecord(floorEfficiencyResults),
    updated_at: new Date().toISOString(),
  };
}

function normalizeCostPayload(caseId, costInputs, costResults) {
  return {
    case_id: caseId,
    inputs_json: asJsonRecord(costInputs),
    results_json: asJsonRecord(costResults),
    updated_at: new Date().toISOString(),
  };
}

async function findExistingCaseByLocalId(supabase, localCaseId, syncContext) {
  if (!localCaseId) {
    return null;
  }

  const { data, error } = await runSyncStep(syncContext, "find-existing-case-by-local-id", () => supabase
    .from("sanze_cases")
    .select("id")
    .filter("raw_json->>local_case_id", "eq", localCaseId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle());

  if (error) {
    throwStepError(error, "find-existing-case-by-local-id");
  }

  return data;
}

async function upsertCase(supabase, normalizedCase, syncContext) {
  let existingCase = null;

  if (normalizedCase.caseCode) {
    const { data, error } = await runSyncStep(syncContext, "find-existing-case-by-code", () => supabase
      .from("sanze_cases")
      .select("id")
      .eq("case_code", normalizedCase.caseCode)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle());

    if (error) {
      throwStepError(error, "find-existing-case-by-code");
    }

    existingCase = data;
  }

  if (!existingCase?.id) {
    existingCase = await findExistingCaseByLocalId(supabase, normalizedCase.localCaseId, syncContext);
  }

  if (existingCase?.id) {
    const { data, error } = await runSyncStep(syncContext, "update-sanze-cases", () => supabase
      .from("sanze_cases")
      .update(normalizedCase.row)
      .eq("id", existingCase.id)
      .select("id")
      .single());

    if (error) {
      throwStepError(error, "update-sanze-cases");
    }

    return data.id;
  }

  const { data, error } = await runSyncStep(syncContext, "insert-sanze-cases", () => supabase
    .from("sanze_cases")
    .insert(normalizedCase.row)
    .select("id")
    .single());

  if (error) {
    throwStepError(error, "insert-sanze-cases");
  }

  return data.id;
}

async function upsertByCaseId(supabase, table, row, syncContext, step) {
  const { data: existingRow, error: selectError } = await runSyncStep(syncContext, step, () => supabase
    .from(table)
    .select("id")
    .eq("case_id", row.case_id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle());

  if (selectError) {
    throwStepError(selectError, step);
  }

  if (existingRow?.id) {
    const { error } = await runSyncStep(syncContext, step, () => supabase
      .from(table)
      .update(row)
      .eq("id", existingRow.id));

    if (error) {
      throwStepError(error, step);
    }

    return existingRow.id;
  }

  const { data, error } = await runSyncStep(syncContext, step, () => supabase
    .from(table)
    .insert(row)
    .select("id")
    .single());

  if (error) {
    throwStepError(error, step);
  }

  return data.id;
}

function buildSyncSummary(body) {
  const roster = isPlainRecord(body.rosterStaging) ? body.rosterStaging : {};
  const landRows = getRosterLandRows(roster);
  const buildingRows = getRosterBuildingRows(roster);

  return {
    caseName: toText(body.case?.name) || toText(body.case?.case_name) || "未命名案件",
    landRowCount: landRows.length,
    buildingRowCount: buildingRows.length,
    hasCapacityData: isPlainRecord(body.capacityInputs) || isPlainRecord(body.capacityResults),
    hasFloorEfficiencyData: isPlainRecord(body.floorEfficiencyParams) || isPlainRecord(body.floorEfficiencyResults),
    hasCostData: isPlainRecord(body.costInputs) || isPlainRecord(body.costResults),
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, message: "只接受 POST。" });
    return;
  }

  const syncContext = { step: "validate-session" };

  try {
    markSyncStep(syncContext, "validate-session");
    const session = requireSanzeSession(request, response);
    if (!session) {
      return;
    }

    markSyncStep(syncContext, "validate-env");
    const supabase = requireSupabaseAdmin(response);
    if (!supabase) {
      return;
    }

    markSyncStep(syncContext, "parse-body");
    const body = await readJsonBody(request);

    markSyncStep(syncContext, "resolve-case");
    const normalizedCase = normalizeCasePayload(body.case);

    if (!normalizedCase.localCaseId && !normalizedCase.caseCode) {
      sendJson(response, 400, { ok: false, message: "缺少案件資料。" });
      return;
    }

    const caseId = await upsertCase(supabase, normalizedCase, syncContext);
    await upsertByCaseId(
      supabase,
      "sanze_roster_staging",
      normalizeRosterPayload(caseId, body.rosterStaging),
      syncContext,
      "upsert-roster-staging",
    );
    await upsertByCaseId(
      supabase,
      "sanze_base_info",
      normalizeBaseInfoPayload(caseId, body.baseInfo, body.rosterStaging),
      syncContext,
      "upsert-base-info",
    );
    await upsertByCaseId(
      supabase,
      "sanze_capacity_data",
      normalizeCapacityPayload(caseId, body.capacityInputs, body.capacityResults),
      syncContext,
      "upsert-capacity-data",
    );
    await upsertByCaseId(
      supabase,
      "sanze_floor_efficiency_data",
      normalizeFloorEfficiencyPayload(caseId, body.floorEfficiencyParams, body.floorEfficiencyResults),
      syncContext,
      "upsert-floor-efficiency-data",
    );
    await upsertByCaseId(
      supabase,
      "sanze_cost_data",
      normalizeCostPayload(caseId, body.costInputs, body.costResults),
      syncContext,
      "upsert-cost-data",
    );

    markSyncStep(syncContext, "done");
    sendJson(response, 200, {
      ok: true,
      caseId,
      syncedTables: [
        "sanze_cases",
        "sanze_roster_staging",
        "sanze_base_info",
        "sanze_capacity_data",
        "sanze_floor_efficiency_data",
        "sanze_cost_data",
      ],
      summary: buildSyncSummary(body),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const step = sanitizeDebugText(error?.syncStep || syncContext.step || "unknown");
    const debug = buildSanitizedSupabaseDebug(error);

    console.error("Sanze DB sync failed", {
      step,
      debug,
    });

    sendJson(response, 500, {
      ok: false,
      code: DB_SYNC_FAILED_CODE,
      step,
      message: DB_SYNC_FAILED_MESSAGE,
      debug,
    });
  }
}
