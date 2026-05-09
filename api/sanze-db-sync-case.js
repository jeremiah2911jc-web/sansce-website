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

function normalizeCasePayload(caseItem) {
  const rawCase = isPlainRecord(caseItem) ? caseItem : {};
  const localCaseId = toText(rawCase.id) || toText(rawCase.caseId);
  const caseCode = toText(rawCase.code) || toText(rawCase.case_code) || localCaseId;

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
    summary_json: isPlainRecord(roster.summary) ? roster.summary : {},
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
  const summary = isPlainRecord(roster.summary) ? roster.summary : {};
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

async function upsertCase(supabase, normalizedCase) {
  const { data: existingCase, error: selectError } = await supabase
    .from("sanze_cases")
    .select("id")
    .eq("case_code", normalizedCase.caseCode)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingCase?.id) {
    const { data, error } = await supabase
      .from("sanze_cases")
      .update(normalizedCase.row)
      .eq("id", existingCase.id)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  const { data, error } = await supabase
    .from("sanze_cases")
    .insert(normalizedCase.row)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function upsertByCaseId(supabase, table, row) {
  const { data: existingRow, error: selectError } = await supabase
    .from(table)
    .select("id")
    .eq("case_id", row.case_id)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingRow?.id) {
    const { error } = await supabase
      .from(table)
      .update(row)
      .eq("id", existingRow.id);

    if (error) {
      throw error;
    }

    return existingRow.id;
  }

  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, message: "只接受 POST。" });
    return;
  }

  const session = requireSanzeSession(request, response);
  if (!session) {
    return;
  }

  const supabase = requireSupabaseAdmin(response);
  if (!supabase) {
    return;
  }

  const body = await readJsonBody(request);
  const normalizedCase = normalizeCasePayload(body.case);

  if (!normalizedCase.localCaseId && !normalizedCase.caseCode) {
    sendJson(response, 400, { ok: false, message: "缺少案件資料。" });
    return;
  }

  try {
    const caseId = await upsertCase(supabase, normalizedCase);
    await upsertByCaseId(supabase, "sanze_roster_staging", normalizeRosterPayload(caseId, body.rosterStaging));
    await upsertByCaseId(supabase, "sanze_base_info", normalizeBaseInfoPayload(caseId, body.baseInfo, body.rosterStaging));

    sendJson(response, 200, {
      ok: true,
      caseId,
      syncedTables: ["sanze_cases", "sanze_roster_staging", "sanze_base_info"],
      updatedAt: new Date().toISOString(),
    });
  } catch {
    sendJson(response, 500, {
      ok: false,
      message: "資料庫同步失敗，目前仍使用本機測試資料。",
    });
  }
}
