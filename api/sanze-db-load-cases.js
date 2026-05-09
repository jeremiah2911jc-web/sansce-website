import { sendJson } from "./_sanze-system-auth.js";
import {
  asArray,
  isPlainRecord,
  requireSanzeSession,
  requireSupabaseAdmin,
  toText,
} from "./_sanze-db-route-helpers.js";

function buildCaseFromRow(row) {
  const rawJson = isPlainRecord(row.raw_json) ? row.raw_json : {};
  const localCaseId = toText(rawJson.id) || toText(rawJson.local_case_id) || `db-${row.id}`;

  return {
    ...rawJson,
    id: localCaseId,
    code: toText(rawJson.code) || toText(row.case_code),
    name: toText(rawJson.name) || toText(row.case_name) || "未命名案件",
    path: toText(rawJson.path) || toText(row.development_path),
    status: toText(rawJson.status) || toText(row.case_status),
    consultant: toText(rawJson.consultant) || toText(row.consultant_name),
    updated: toText(rawJson.updated) || toText(row.last_updated_label),
    note: toText(rawJson.note) || toText(row.version_note),
    dbCaseId: row.id,
    dbSyncedAt: row.updated_at || row.created_at || "",
  };
}

function buildRosterFromRow(row) {
  return {
    dbRosterId: row.id,
    fileName: row.source_filename || "",
    sourceFilename: row.source_filename || "",
    sourceType: row.source_type || "",
    importedAt: row.imported_at || "",
    updatedAt: row.updated_at || "",
    landRights: asArray(row.land_rows),
    buildingRights: asArray(row.building_rows),
    partyGroups: asArray(row.pg_groups),
    summary: isPlainRecord(row.summary_json) ? row.summary_json : {},
    versionHistory: asArray(row.version_history),
    priceUpdateHistory: asArray(row.price_update_history),
  };
}

function buildBaseInfoFromRow(row) {
  const rawJson = isPlainRecord(row.base_info_json) ? row.base_info_json : {};

  return {
    ...rawJson,
    city: toText(rawJson.city) || toText(row.city),
    district: toText(rawJson.district) || toText(row.district),
    section: toText(rawJson.section) || toText(row.section),
    subsection: toText(rawJson.subsection) || toText(row.subsection),
    dbBaseInfoId: row.id,
    dbSyncedAt: row.updated_at || row.created_at || "",
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { ok: false, message: "只接受 GET。" });
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

  try {
    const { data: caseRows, error: casesError } = await supabase
      .from("sanze_cases")
      .select("*")
      .is("archived_at", null)
      .order("updated_at", { ascending: false });

    if (casesError) {
      throw casesError;
    }

    const cases = asArray(caseRows).map(buildCaseFromRow);
    const dbCaseIdToLocalId = new Map(asArray(caseRows).map((row, index) => [row.id, cases[index].id]));
    const dbCaseIds = asArray(caseRows).map((row) => row.id).filter(Boolean);

    let rosterRows = [];
    let baseInfoRows = [];

    if (dbCaseIds.length) {
      const [{ data: loadedRosterRows, error: rosterError }, { data: loadedBaseInfoRows, error: baseInfoError }] = await Promise.all([
        supabase
          .from("sanze_roster_staging")
          .select("*")
          .in("case_id", dbCaseIds),
        supabase
          .from("sanze_base_info")
          .select("*")
          .in("case_id", dbCaseIds),
      ]);

      if (rosterError) {
        throw rosterError;
      }

      if (baseInfoError) {
        throw baseInfoError;
      }

      rosterRows = asArray(loadedRosterRows);
      baseInfoRows = asArray(loadedBaseInfoRows);
    }

    const rosterStagingByCaseId = Object.fromEntries(
      rosterRows
        .map((row) => [dbCaseIdToLocalId.get(row.case_id), buildRosterFromRow(row)])
        .filter(([caseId]) => Boolean(caseId)),
    );
    const baseInfoByCaseId = Object.fromEntries(
      baseInfoRows
        .map((row) => [dbCaseIdToLocalId.get(row.case_id), buildBaseInfoFromRow(row)])
        .filter(([caseId]) => Boolean(caseId)),
    );

    sendJson(response, 200, {
      ok: true,
      cases,
      rosterStagingByCaseId,
      baseInfoByCaseId,
      loadedAt: new Date().toISOString(),
    });
  } catch {
    sendJson(response, 500, {
      ok: false,
      message: "資料庫載入失敗，目前仍保留本機測試資料。",
    });
  }
}
