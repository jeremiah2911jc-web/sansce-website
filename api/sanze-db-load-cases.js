import { sendJson } from "./_sanze-system-auth.js";
import {
  asArray,
  isPlainRecord,
  requireSanzeSession,
  requireSupabaseAdmin,
  toText,
} from "./_sanze-db-route-helpers.js";

function asJsonRecord(value) {
  return isPlainRecord(value) ? value : {};
}

function buildCaseFromRow(row) {
  const rawJson = asJsonRecord(row.raw_json);
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
  const landRows = asArray(row.land_rows);
  const buildingRows = asArray(row.building_rows);
  const partyGroups = asArray(row.pg_groups);

  return {
    dbRosterId: row.id,
    fileName: row.source_filename || "",
    sourceFilename: row.source_filename || "",
    sourceType: row.source_type || "",
    importedAt: row.imported_at || "",
    updatedAt: row.updated_at || "",
    landRights: landRows,
    landRows,
    buildingRights: buildingRows,
    buildingRows,
    partyGroups,
    pgGroups: partyGroups,
    summary: asJsonRecord(row.summary_json),
    versionHistory: asArray(row.version_history),
    priceUpdateHistory: asArray(row.price_update_history),
  };
}

function buildBaseInfoFromRow(row) {
  const rawJson = asJsonRecord(row.base_info_json);

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

function buildCapacityFromRow(row) {
  const inputs = asJsonRecord(row.inputs_json);
  const results = asJsonRecord(row.results_json);
  const tdrScoring = asJsonRecord(row.tdr_scoring_json);
  const tdrScoringSummary = asJsonRecord(row.tdr_scoring_summary_json);

  return {
    inputs: {
      ...inputs,
      tdrScoring: isPlainRecord(inputs.tdrScoring) ? inputs.tdrScoring : tdrScoring,
    },
    results: {
      ...results,
      tdrScoringSummary: isPlainRecord(results.tdrScoringSummary)
        ? results.tdrScoringSummary
        : tdrScoringSummary,
    },
  };
}

function buildFloorEfficiencyFromRow(row) {
  return {
    params: asJsonRecord(row.params_json),
    results: asJsonRecord(row.results_json),
  };
}

function buildCostFromRow(row) {
  return {
    inputs: asJsonRecord(row.inputs_json),
    results: asJsonRecord(row.results_json),
  };
}

function mapRowsByLocalCaseId(rows, dbCaseIdToLocalId, buildValue) {
  const entries = {};
  asArray(rows).forEach((row) => {
    const localCaseId = dbCaseIdToLocalId.get(row.case_id);
    if (!localCaseId || entries[localCaseId] !== undefined) {
      return;
    }
    entries[localCaseId] = buildValue(row);
  });
  return entries;
}

function splitPairedRows(rowsByCaseId, inputKey, resultKey) {
  const inputsByCaseId = {};
  const resultsByCaseId = {};

  Object.entries(rowsByCaseId).forEach(([caseId, value]) => {
    inputsByCaseId[caseId] = value[inputKey] ?? {};
    resultsByCaseId[caseId] = value[resultKey] ?? {};
  });

  return { inputsByCaseId, resultsByCaseId };
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
    let capacityRows = [];
    let floorEfficiencyRows = [];
    let costRows = [];

    if (dbCaseIds.length) {
      const [
        { data: loadedRosterRows, error: rosterError },
        { data: loadedBaseInfoRows, error: baseInfoError },
        { data: loadedCapacityRows, error: capacityError },
        { data: loadedFloorEfficiencyRows, error: floorEfficiencyError },
        { data: loadedCostRows, error: costError },
      ] = await Promise.all([
        supabase
          .from("sanze_roster_staging")
          .select("*")
          .in("case_id", dbCaseIds)
          .order("updated_at", { ascending: false }),
        supabase
          .from("sanze_base_info")
          .select("*")
          .in("case_id", dbCaseIds)
          .order("updated_at", { ascending: false }),
        supabase
          .from("sanze_capacity_data")
          .select("*")
          .in("case_id", dbCaseIds)
          .order("updated_at", { ascending: false }),
        supabase
          .from("sanze_floor_efficiency_data")
          .select("*")
          .in("case_id", dbCaseIds)
          .order("updated_at", { ascending: false }),
        supabase
          .from("sanze_cost_data")
          .select("*")
          .in("case_id", dbCaseIds)
          .order("updated_at", { ascending: false }),
      ]);

      if (rosterError || baseInfoError || capacityError || floorEfficiencyError || costError) {
        throw rosterError || baseInfoError || capacityError || floorEfficiencyError || costError;
      }

      rosterRows = asArray(loadedRosterRows);
      baseInfoRows = asArray(loadedBaseInfoRows);
      capacityRows = asArray(loadedCapacityRows);
      floorEfficiencyRows = asArray(loadedFloorEfficiencyRows);
      costRows = asArray(loadedCostRows);
    }

    const rosterStagingByCaseId = mapRowsByLocalCaseId(rosterRows, dbCaseIdToLocalId, buildRosterFromRow);
    const baseInfoByCaseId = mapRowsByLocalCaseId(baseInfoRows, dbCaseIdToLocalId, buildBaseInfoFromRow);
    const capacityByCaseId = mapRowsByLocalCaseId(capacityRows, dbCaseIdToLocalId, buildCapacityFromRow);
    const floorEfficiencyByCaseId = mapRowsByLocalCaseId(floorEfficiencyRows, dbCaseIdToLocalId, buildFloorEfficiencyFromRow);
    const costByCaseId = mapRowsByLocalCaseId(costRows, dbCaseIdToLocalId, buildCostFromRow);
    const {
      inputsByCaseId: capacityInputsByCaseId,
      resultsByCaseId: capacityResultsByCaseId,
    } = splitPairedRows(capacityByCaseId, "inputs", "results");
    const {
      inputsByCaseId: floorEfficiencyParamsByCaseId,
      resultsByCaseId: floorEfficiencyResultsByCaseId,
    } = splitPairedRows(floorEfficiencyByCaseId, "params", "results");
    const {
      inputsByCaseId: costInputsByCaseId,
      resultsByCaseId: costResultsByCaseId,
    } = splitPairedRows(costByCaseId, "inputs", "results");

    sendJson(response, 200, {
      ok: true,
      cases,
      rosterStagingByCaseId,
      baseInfoByCaseId,
      capacityInputsByCaseId,
      capacityResultsByCaseId,
      floorEfficiencyParamsByCaseId,
      floorEfficiencyResultsByCaseId,
      costInputsByCaseId,
      costResultsByCaseId,
      loadedAt: new Date().toISOString(),
    });
  } catch {
    sendJson(response, 500, {
      ok: false,
      message: "資料庫載入失敗，目前仍保留本機測試資料。",
    });
  }
}
