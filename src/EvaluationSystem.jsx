import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  Settings2,
} from "lucide-react";
import {
  developmentPaths,
  evaluationModules,
  moduleFlowMap,
  roleVisibilityRules,
  workflowStages,
} from "./evaluationSystemData.js";
import {
  INTERNAL_DECIMAL_DIGITS,
  SHARE_TOTAL_TOLERANCE,
  formatAreaPing,
  formatAreaSqm,
  formatNumber as formatPrecisionNumber,
  parsePrecisionNumber,
  parseRatio,
  pingToSqm,
  roundForStorage,
  roundRecordNumbers,
  sqmToPing,
} from "./evaluationPrecision.js";

const defaultCaseForm = {
  code: "",
  name: "",
  path: "",
  status: "",
  consultant: "",
  updated: "",
  note: "",
};

function buildCaseFormFromCase(caseItem) {
  return {
    code: caseItem.code ?? "",
    name: caseItem.name ?? "",
    path: caseItem.path ?? "",
    status: caseItem.status ?? "",
    consultant: caseItem.consultant ?? "",
    updated: caseItem.updated ?? "",
    note: caseItem.note ?? "",
  };
}

function getNextCaseCode(cases) {
  const maxNumber = cases.reduce((max, item) => {
    const match = /^CASE-(\d+)$/i.exec(item.code ?? "");
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `CASE-${String(maxNumber + 1).padStart(3, "0")}`;
}

function normalizeCaseForm(caseForm, fallbackCode) {
  return {
    code: caseForm.code.trim() || fallbackCode,
    name: caseForm.name.trim() || "未命名案件",
    path: caseForm.path.trim() || "待選擇開發路徑",
    status: caseForm.status.trim() || "評估中",
    consultant: caseForm.consultant.trim() || "三策顧問",
    updated: caseForm.updated.trim() || new Date().toLocaleDateString("zh-TW"),
    note: caseForm.note.trim() || "前端測試案件",
  };
}

const caseDataFlow = [
  "建立案件",
  "選定目前案件",
  "填基地基本資料",
  "上傳土地清冊 / 建物清冊",
  "進行坪效、成本、銷售、分配、現金流、銀行報告等試算",
];

const TAKEOVER_MODULE_ID = "takeover-evaluation";
const ADMIN_ONLY_MODULE_IDS = new Set(["license-management", "security-protection"]);
const LICENSE_GATED_MODULES = {
  "bank-report": "bankReport",
  [TAKEOVER_MODULE_ID]: "takeover",
};
const SYSTEM_TEST_HASH = "#system-test";
const CASES_STORAGE_KEY = "sanze-evaluation-cases-v1";
const CURRENT_CASE_ID_STORAGE_KEY = "sanze-evaluation-current-case-id-v1";
const ROSTER_STAGING_STORAGE_KEY = "sanze-evaluation-roster-staging-v1";
const BASE_INFO_STORAGE_KEY = "sanze-evaluation-base-info-v1";
const CAPACITY_INPUTS_STORAGE_KEY = "sanze-evaluation-capacity-inputs-v1";
const CAPACITY_RESULTS_STORAGE_KEY = "sanze-evaluation-capacity-results-v1";
const FLOOR_EFFICIENCY_PARAMS_STORAGE_KEY = "sanze-evaluation-floor-efficiency-params-v1";
const FLOOR_EFFICIENCY_RESULTS_STORAGE_KEY = "sanze-evaluation-floor-efficiency-results-v1";
const COST_INPUTS_STORAGE_KEY = "sanze-evaluation-cost-inputs-v1";
const COST_RESULTS_STORAGE_KEY = "sanze-evaluation-cost-results-v1";
const SALES_SCENARIOS_STORAGE_KEY = "sanze-evaluation-sales-scenarios-v1";
const ALLOCATION_INPUTS_STORAGE_KEY = "sanze-evaluation-allocation-inputs-v1";
const ALLOCATION_RESULTS_STORAGE_KEY = "sanze-evaluation-allocation-results-v1";
const CASHFLOW_INPUTS_STORAGE_KEY = "sanze-evaluation-cashflow-inputs-v1";
const CASHFLOW_RESULTS_STORAGE_KEY = "sanze-evaluation-cashflow-results-v1";
const BANK_REPORT_DATA_STORAGE_KEY = "sanze-evaluation-bank-report-data-v1";
const LOCAL_TEST_DATA_APP = "sanze-evaluation-system";
const LOCAL_TEST_DATA_TYPE = "local-test-data";
const LOCAL_TEST_DATA_SCHEMA_VERSION = 2;
const SUPPORTED_LOCAL_TEST_DATA_SCHEMA_VERSIONS = new Set([1, 2]);
const LOCAL_TEST_DATA_COMMIT_HINT = "cbddef4";
const LOCAL_TEST_DATA_RECORD_FIELDS = [
  { dataKey: "capacityInputsByCaseId", storageKey: CAPACITY_INPUTS_STORAGE_KEY },
  { dataKey: "capacityResultsByCaseId", storageKey: CAPACITY_RESULTS_STORAGE_KEY },
  { dataKey: "floorEfficiencyParamsByCaseId", storageKey: FLOOR_EFFICIENCY_PARAMS_STORAGE_KEY },
  { dataKey: "floorEfficiencyResultsByCaseId", storageKey: FLOOR_EFFICIENCY_RESULTS_STORAGE_KEY },
  { dataKey: "costInputsByCaseId", storageKey: COST_INPUTS_STORAGE_KEY },
  { dataKey: "costResultsByCaseId", storageKey: COST_RESULTS_STORAGE_KEY },
  { dataKey: "salesScenariosByCaseId", storageKey: SALES_SCENARIOS_STORAGE_KEY },
  { dataKey: "allocationInputsByCaseId", storageKey: ALLOCATION_INPUTS_STORAGE_KEY },
  { dataKey: "allocationResultsByCaseId", storageKey: ALLOCATION_RESULTS_STORAGE_KEY },
  { dataKey: "cashflowInputsByCaseId", storageKey: CASHFLOW_INPUTS_STORAGE_KEY },
  { dataKey: "cashflowResultsByCaseId", storageKey: CASHFLOW_RESULTS_STORAGE_KEY },
  { dataKey: "bankReportDataByCaseId", storageKey: BANK_REPORT_DATA_STORAGE_KEY },
];
const EVALUATION_STORAGE_KEYS = [
  CASES_STORAGE_KEY,
  CURRENT_CASE_ID_STORAGE_KEY,
  ROSTER_STAGING_STORAGE_KEY,
  BASE_INFO_STORAGE_KEY,
  ...LOCAL_TEST_DATA_RECORD_FIELDS.map((field) => field.storageKey),
];
const primaryEvaluationModules = evaluationModules.filter((module) => module.id !== TAKEOVER_MODULE_ID);
const takeoverEvaluationModule = evaluationModules.find((module) => module.id === TAKEOVER_MODULE_ID);

const defaultBaseInfo = {
  location: "",
  scope: "",
  city: "",
  district: "",
  landSection: "",
  zoning: "",
  buildingCoverageRatio: "",
  baseFloorAreaRatio: "",
  siteShape: "",
  roadAccess: "",
  siteRestrictions: "",
  legalRestrictions: "",
  note: "",
};

const defaultTdrScoringInputs = {
  roadWidthMeters: "",
  minimumSideLengthBand: "",
  interiorAnglesQualified: false,
  adjacentRoadCondition: "",
  boundarySetback: "",
  publicFacilityArea: "",
  todDistance: "",
  connectedLandRatio: "",
  publicFacilityRatio: "",
  priorityPublicFacilityRatio: "",
  announcedAcquisitionScore: "",
  fullOwnershipOpenedRoad: false,
  fullCashPayment: false,
  plazaOpenSpaceRatio: "",
  sidewalkOpenSpaceCondition: "",
  donateSocialHousing: false,
  donateChildcare: false,
  donateElderlyCare: false,
  publicFacilityImprovementLocation: "",
  environmentImprovementScore: "",
  greenTransportProvided: false,
  greenTransportAddedCapacityOver6000: false,
  greenTransportEstimatedCost: "",
};

const defaultCapacityInputs = {
  baseFloorAreaRatio: "",
  transferRatio: "",
  urbanRenewalCentralBonusRatio: "",
  urbanRenewalLocalBonusRatio: "",
  urbanRenewalBonusRatio: "",
  unsafeBuildingApplicable: "",
  unsafeBuildingBonusRatio: "",
  otherBonusRatio: "",
  incrementalCapacityApplicable: "",
  incrementalCapacityRatio: "",
  incrementalCapacityPriceStatus: "",
  incrementalCapacityFeedback: "",
  tdrRoadWidthStatus: "",
  tdrSiteScoreStatus: "",
  tdrDonorAssessedCurrentValue: "",
  tdrRecipientAssessedCurrentValue: "",
  tdrRecipientFloorAreaRatio: "",
  tdrMarketUnitPricePerPing: "",
  tdrMarketPriceMultiplier: "",
  tdrScrivenerFee: "",
  tdrDonationAgencyFee: "",
  tdrOtherFee: "",
  tdrAppraisalMethodNote: "",
  tdrAppraiserFee: "",
  tdrCashPaymentAgencyFee: "",
  tdrCashPaymentStatus: "",
  otherCapacitySourceNote: "",
  tdrScoring: defaultTdrScoringInputs,
};

const tdrScoringDocuments = {
  road: ["接受基地之都市計畫圖", "都市計畫道路綜理表"],
  siteCompleteness: [
    "接受基地 500 公尺範圍內之都市計畫圖套繪地籍圖",
    "接受基地土地登記謄本",
    "接受基地地籍圖謄本",
    "接受基地之都市計畫圖",
    "都市計畫道路綜理表",
  ],
  surrounding: [
    "接受基地 500 公尺範圍內之都市計畫圖套繪地籍圖或地形圖",
    "公共設施用地土地使用分區證明書",
    "公共設施用地土地登記謄本",
    "公共設施用地已開闢證明文件",
    "捷運車站或火車站出入口土地使用分區證明",
    "必要時捷運車站結構體細部設計圖",
  ],
  sendingSite: [
    "送出基地土地登記謄本",
    "送出基地土地使用分區證明書",
    "面積計算表",
    "應優先取得公共設施用地證明文件",
    "道路維管證明文件",
    "依公告取得方式應檢附文件",
  ],
  openSpace: ["地面層增設開放空間平面配置圖", "剖面圖"],
  welfare: ["建築物配置圖", "規劃設計圖", "相關機關同意文件"],
  publicFacilityImprovement: [
    "接受基地 500 公尺範圍內之都市計畫圖套繪地籍圖",
    "公共設施土地登記謄本",
    "公共設施土地使用分區證明書",
    "相關機關同意文件",
  ],
  environmentPrice: ["接受基地土地登記謄本", "接受基地面積計算表", "環境改善價金計算式說明"],
  greenTransport: ["地面層配置 UBIKE 位置圖", "相關機關同意設置文件"],
};

const tdrScoringMasterDocuments = [
  "都市計畫圖",
  "都市計畫道路綜理表",
  "土地登記謄本",
  "地籍圖謄本",
  "地籍圖套繪都市計畫圖",
  "土地使用分區證明",
  "面積計算表",
  "地面層配置圖",
  "剖面圖",
  "建築物配置圖",
  "規劃設計圖",
  "相關機關同意文件",
  "道路維管證明文件",
  "建築師簽證及大小章",
  "影本文件註明「與正本相符」",
  "申請人用印",
  "建築師開業證書影本",
  "一式兩份、裝訂成冊、側標籤",
  "一項目一套圖，避免同一圖面說明多項評定項目",
];

const tdrScoreOptions = {
  minimumSideLengthBand: [
    ["", "待輸入"],
    ["under8", "8 公尺以下：乙一"],
    ["8to20", "8 公尺以上，未達 20 公尺：乙二"],
    ["20plus", "20 公尺以上：乙三"],
  ],
  adjacentRoadCondition: [
    ["", "依道路寬度自動初判"],
    ["8to15", "道路寬度 8 公尺以上，未達 15 公尺：+1"],
    ["15plus", "道路寬度 15 公尺以上：+2"],
  ],
  boundarySetback: [
    ["", "待輸入"],
    ["3to5", "3 公尺以上，未達 5 公尺：+2"],
    ["5plus", "5 公尺以上：+3"],
  ],
  publicFacilityArea: [
    ["", "待輸入"],
    ["0.2to0.5", "0.2 公頃以上，未達 0.5 公頃：+1"],
    ["0.5plus", "0.5 公頃以上：+2"],
    ["0.5single", "0.5 公頃以上且單一公共設施達 0.5 公頃：+3"],
  ],
  todDistance: [
    ["", "待輸入"],
    ["under300", "距捷運車站或火車站未達 300 公尺：+2"],
    ["300to500", "300 公尺以上，未達 500 公尺：+1"],
  ],
  ratioScore: [
    ["", "待輸入"],
    ["60to80", "60% 以上，未達 80%：+1"],
    ["80to100", "80% 以上，未達 100%：+2"],
    ["100", "100%：+3"],
  ],
  priorityRatioScore: [
    ["", "待輸入"],
    ["40to60", "40% 以上，未達 60%：+1"],
    ["60to80", "60% 以上，未達 80%：+2"],
    ["80plus", "80% 以上：+3"],
  ],
  plazaOpenSpaceRatio: [
    ["", "待輸入"],
    ["10to20", "10% 以上，未達 20% 法定空地面積：+2"],
    ["20to30", "20% 以上，未達 30% 法定空地面積：+4"],
    ["30to40", "30% 以上，未達 40% 法定空地面積：+6"],
    ["40plus", "40% 以上法定空地面積：+8"],
  ],
  sidewalkOpenSpaceCondition: [
    ["", "待輸入"],
    ["1.5one", "1.5 公尺以上未達 4 公尺，單側臨路：+1"],
    ["1.5two", "1.5 公尺以上未達 4 公尺，兩側臨路：+2"],
    ["1.5three", "1.5 公尺以上未達 4 公尺，三側臨路：+3"],
    ["4one", "4 公尺以上，單側臨路：+2"],
    ["4two", "4 公尺以上，兩側臨路：+4"],
    ["4three", "4 公尺以上，三側臨路：+6"],
  ],
  publicFacilityImprovementLocation: [
    ["", "待輸入"],
    ["around", "基地四周，且應鄰接接受基地：+4"],
    ["within500", "基地外圍，且距接受基地 500 公尺範圍內：+2"],
  ],
};

const defaultFloorEfficiencyParams = {
  simpleUrbanRenewalBonusRate: "",
  landUseBonusRate: "",
  tdrRate: "",
  urbanRenewalBonusRate: "",
  dangerousOldBuildingBonusRate: "",
  equipmentExemptionRate: "15%",
  lobbyRate: "10%",
  balconyRate: "5%",
  roofProjectionRate: "12.5%",
  rainShelterRate: "0%",
  buildingEnvelopeRate: "0%",
  publicServiceRate: "0%",
  basementMultiplier: "0.7",
  undergroundFloors: "4",
  parkingUnitAreaPing: "12",
  selfParkingCount: "0",
  motorcycleParkingCount: "0",
  bikeParkingCount: "0",
  saleableAdjustmentRatio: "100%",
  publicAreaRatio: "",
  parkingNote: "",
  deductionNote: "",
};

const baseInfoFields = [
  { key: "location", label: "基地位置", placeholder: "例：新北市泰山區..." },
  { key: "scope", label: "基地範圍", placeholder: "例：更新單元範圍、街廓或鄰近道路界線" },
  { key: "city", label: "縣市", placeholder: "例：新北市" },
  { key: "district", label: "行政區", placeholder: "例：泰山區" },
  { key: "landSection", label: "地段", placeholder: "例：泰山段" },
  { key: "zoning", label: "使用分區", placeholder: "例：住宅區、商業區" },
  { key: "buildingCoverageRatio", label: "建蔽率", placeholder: "例：50%" },
  { key: "baseFloorAreaRatio", label: "基準容積率", placeholder: "例：300%" },
  { key: "siteShape", label: "基地形狀", placeholder: "例：完整街廓、狹長、畸零" },
  {
    key: "roadAccess",
    label: "道路 / 臨路條件",
    placeholder: "包含臨路寬度、臨路方向、道路使用現況或特殊道路限制。",
    wide: true,
  },
  { key: "siteRestrictions", label: "基地限制", placeholder: "例：高程、排水、鄰地、既有使用限制", wide: true },
  { key: "legalRestrictions", label: "法規限制", placeholder: "例：退縮、開放空間、都計或建管限制", wide: true },
  { key: "note", label: "備註", placeholder: "補充清冊未能表達的基地特殊情況", wide: true },
];

const legacyDemoCaseSignatures = [
  {
    id: "case-001",
    code: "CASE-001",
    markers: ["板橋民權段自主更新", "泰山文程段", "自主更新 / 前期評估", "林顧問", "第七版清冊匯入測試"],
  },
  {
    id: "case-002",
    code: "CASE-002",
    markers: ["新店中央路危老重建", "危老重建 / 條件確認", "陳顧問", "等待基地資料補齊"],
  },
  {
    id: "case-003",
    code: "CASE-003",
    markers: ["中和都市更新試算案", "都市更新 / 銀行評估", "王顧問", "銀行報告草稿"],
  },
];

function readStoredJson(key, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStoredJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage is only a front-end staging aid; failures should not block use.
  }
}

function readStoredString(key, fallbackValue = "") {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStoredString(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage is only a front-end staging aid; failures should not block use.
  }
}

function removeStoredJson(key) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // localStorage is only a front-end staging aid; failures should not block use.
  }
}

function clearStoredEvaluationData() {
  EVALUATION_STORAGE_KEYS.forEach(removeStoredJson);
}

function isPlainRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function buildLocalTestDataFileName(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = padDatePart(date.getMonth() + 1);
  const dd = padDatePart(date.getDate());
  const hh = padDatePart(date.getHours());
  const min = padDatePart(date.getMinutes());
  return `sanze-evaluation-test-data-${yyyy}${mm}${dd}-${hh}${min}.json`;
}

function getSourceOrigin() {
  return typeof window === "undefined" ? "unknown" : window.location.origin;
}

function buildLocalTestDataExport({
  cases,
  currentCaseId,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityInputsByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyParamsByCaseId,
  floorEfficiencyResultsByCaseId,
}) {
  const normalizedCases = Array.isArray(cases) ? cases : [];
  const normalizedCurrentCaseId = resolveImportedCurrentCaseId(normalizedCases, currentCaseId);
  const normalizedRosterStaging = isPlainRecord(rosterStagingByCaseId) ? rosterStagingByCaseId : {};
  const normalizedBaseInfo = isPlainRecord(baseInfoByCaseId) ? baseInfoByCaseId : {};
  const normalizedCapacityInputs = isPlainRecord(capacityInputsByCaseId) ? capacityInputsByCaseId : {};
  const normalizedFloorEfficiencyParams = isPlainRecord(floorEfficiencyParamsByCaseId) ? floorEfficiencyParamsByCaseId : {};
  const {
    capacityResultsByCaseId: recalculatedCapacityResults,
    floorEfficiencyResultsByCaseId: recalculatedFloorEfficiencyResults,
  } = recalculateImportedEvaluationResults({
    cases: normalizedCases,
    rosterStagingByCaseId: normalizedRosterStaging,
    baseInfoByCaseId: normalizedBaseInfo,
    capacityInputsByCaseId: normalizedCapacityInputs,
    floorEfficiencyParamsByCaseId: normalizedFloorEfficiencyParams,
  });
  const recordData = {
    capacityInputsByCaseId: normalizedCapacityInputs,
    capacityResultsByCaseId: recalculatedCapacityResults,
    floorEfficiencyParamsByCaseId: normalizedFloorEfficiencyParams,
    floorEfficiencyResultsByCaseId: recalculatedFloorEfficiencyResults,
  };

  LOCAL_TEST_DATA_RECORD_FIELDS.forEach(({ dataKey, storageKey }) => {
    if (recordData[dataKey] === undefined) {
      recordData[dataKey] = loadStoredRecord(storageKey);
    }
  });

  return {
    app: LOCAL_TEST_DATA_APP,
    type: LOCAL_TEST_DATA_TYPE,
    schemaVersion: LOCAL_TEST_DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      origin: getSourceOrigin(),
      commitHint: LOCAL_TEST_DATA_COMMIT_HINT,
    },
    data: {
      cases: normalizedCases,
      currentCaseId: normalizedCurrentCaseId,
      rosterStagingByCaseId: normalizedRosterStaging,
      baseInfoByCaseId: normalizedBaseInfo,
      ...Object.fromEntries(
        LOCAL_TEST_DATA_RECORD_FIELDS.map(({ dataKey }) => [
          dataKey,
          isPlainRecord(recordData[dataKey]) ? recordData[dataKey] : {},
        ]),
      ),
    },
  };
}

function downloadJsonFile(payload, fileName) {
  if (typeof document === "undefined") {
    return;
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resolveImportedCurrentCaseId(cases, importedCurrentCaseId) {
  if (importedCurrentCaseId && cases.some((caseItem) => caseItem.id === importedCurrentCaseId)) {
    return importedCurrentCaseId;
  }

  return cases.length === 1 ? cases[0]?.id ?? "" : "";
}

function validateLocalTestDataPayload(payload) {
  const invalidMessage = "這不是有效的三策開發評估系統測試資料檔，請確認檔案來源。";

  if (!isPlainRecord(payload)) {
    return { ok: false, message: invalidMessage };
  }

  if (payload.app !== LOCAL_TEST_DATA_APP || payload.type !== LOCAL_TEST_DATA_TYPE) {
    return { ok: false, message: invalidMessage };
  }

  if (!SUPPORTED_LOCAL_TEST_DATA_SCHEMA_VERSIONS.has(payload.schemaVersion)) {
    return { ok: false, message: "schemaVersion 不支援，請確認檔案來源。" };
  }

  if (!isPlainRecord(payload.data)) {
    return { ok: false, message: "data 結構缺漏，請確認檔案來源。" };
  }

  if (!Array.isArray(payload.data.cases)) {
    return { ok: false, message: "cases 不是陣列，請確認檔案來源。" };
  }

  if (!isPlainRecord(payload.data.rosterStagingByCaseId)) {
    return { ok: false, message: "rosterStagingByCaseId 不是 object，請確認檔案來源。" };
  }

  if (!isPlainRecord(payload.data.baseInfoByCaseId)) {
    return { ok: false, message: "baseInfoByCaseId 不是 object，請確認檔案來源。" };
  }

  const cases = payload.data.cases;
  const currentCaseId = typeof payload.data.currentCaseId === "string" ? payload.data.currentCaseId : "";
  const recordData = {};

  for (const { dataKey } of LOCAL_TEST_DATA_RECORD_FIELDS) {
    const value = payload.data[dataKey];
    if (value === undefined) {
      recordData[dataKey] = {};
    } else if (isPlainRecord(value)) {
      recordData[dataKey] = value;
    } else {
      return { ok: false, message: `${dataKey} 不是 object，請確認檔案來源。` };
    }
  }

  return {
    ok: true,
    data: {
      cases,
      currentCaseId,
      rosterStagingByCaseId: payload.data.rosterStagingByCaseId,
      baseInfoByCaseId: payload.data.baseInfoByCaseId,
      ...recordData,
    },
    meta: {
      exportedAt: typeof payload.exportedAt === "string" ? payload.exportedAt : "",
      schemaVersion: payload.schemaVersion,
    },
  };
}

function countCaseRecords(...records) {
  const caseIds = new Set();
  records.forEach((record) => {
    if (isPlainRecord(record)) {
      Object.keys(record).forEach((caseId) => caseIds.add(caseId));
    }
  });
  return caseIds.size;
}

function parseNumericInput(value) {
  return parseRosterNumber(value);
}

function formatNumber(value, maximumFractionDigits = 2, minimumFractionDigits = 0) {
  if (!Number.isFinite(value)) {
    return "待補資料";
  }

  return formatPrecisionNumber(value, maximumFractionDigits, { minimumFractionDigits });
}

function formatPercentValue(value) {
  if (!Number.isFinite(value)) {
    return "待補資料";
  }

  return `${formatNumber(value, 2)}%`;
}

function formatCurrencyTwd(value) {
  return Number.isFinite(value) ? `${formatNumber(value, 0)} 元` : "清冊未提供";
}

function formatCurrencyTwdDecimal(value, digits = 2) {
  return Number.isFinite(value) ? `${formatNumber(value, digits, digits)} 元` : "清冊未提供";
}

function formatCurrencyTwdPerSqm(value, digits = 2) {
  return Number.isFinite(value) ? `${formatCurrencyTwdDecimal(value, digits)} / 平方公尺` : "清冊未提供";
}

function formatSqm(value) {
  return formatAreaSqm(value);
}

function formatPing(value) {
  return formatAreaPing(value);
}

function convertSqmToPing(value) {
  return sqmToPing(value);
}

function formatSqmAndPing(value) {
  if (!Number.isFinite(value)) {
    return "待補資料";
  }

  return `${formatSqm(value)} / 約 ${formatPing(convertSqmToPing(value))}`;
}

function getModuleSaveStatusLabel(saveStatus) {
  if (saveStatus?.state === "dirty") {
    return "尚有未儲存變更";
  }

  if (saveStatus?.state === "saved") {
    return "本機測試資料已儲存";
  }

  return "目前資料已自動暫存於本機，可按下儲存確認本模組狀態";
}

function getCurrentSaveStatus(moduleSaveStatusByCaseId, caseId, moduleId) {
  return moduleSaveStatusByCaseId?.[caseId]?.[moduleId] ?? { state: "ready", savedAt: "" };
}

function getCaseSignatureText(caseItem) {
  return [
    caseItem?.name,
    caseItem?.path,
    caseItem?.status,
    caseItem?.consultant,
    caseItem?.note,
  ].map((value) => normalizeCellValue(value)).join(" | ");
}

function isLegacyDemoCase(caseItem) {
  const signature = legacyDemoCaseSignatures.find((item) => (
    item.id === caseItem?.id || item.code === caseItem?.code
  ));

  if (!signature) {
    return false;
  }

  const signatureText = getCaseSignatureText(caseItem);
  return signature.markers.some((marker) => signatureText.includes(marker));
}

function loadStoredCases() {
  const storedCases = readStoredJson(CASES_STORAGE_KEY, []);
  return Array.isArray(storedCases) ? storedCases.filter((caseItem) => !isLegacyDemoCase(caseItem)) : [];
}

function loadStoredCurrentCaseId() {
  return readStoredString(CURRENT_CASE_ID_STORAGE_KEY, "");
}

function loadStoredRecord(key) {
  const storedRecord = readStoredJson(key, {});
  return storedRecord && typeof storedRecord === "object" && !Array.isArray(storedRecord) ? storedRecord : {};
}

const mockAccessProfiles = {
  admin: {
    label: "三策管理員",
    roleLabel: "admin",
    plan: "管理端",
    permissions: {
      takeover: true,
      bankReport: true,
      systemParameters: true,
      adminModules: true,
    },
  },
  user: {
    label: "一般使用者",
    roleLabel: "user",
    plan: "基礎版",
    permissions: {
      takeover: false,
      bankReport: false,
      systemParameters: false,
      adminModules: false,
    },
  },
};

function canViewModule(module, profile) {
  if (ADMIN_ONLY_MODULE_IDS.has(module.id)) {
    return profile.permissions.adminModules;
  }

  const gatedPermission = LICENSE_GATED_MODULES[module.id];
  if (gatedPermission) {
    return profile.permissions[gatedPermission];
  }

  return true;
}

function PlaceholderInput({ label }) {
  return (
    <label className="eval-field">
      <span>{label}</span>
      <input type="text" placeholder="待輸入" readOnly />
    </label>
  );
}

function SkeletonTable({ columns, rows }) {
  const tableRows = rows?.length ? rows : ["範例列 1", "範例列 2", "範例列 3"];

  return (
    <div className="eval-table-wrap">
      <table className="eval-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => (
            <tr key={`${row}-${index}`}>
              {columns.map((column, columnIndex) => (
                <td key={`${row}-${column}`}>
                  {columnIndex === 0 ? row : <span className="eval-muted">待建立</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkflowStageStrip({ activeModuleId }) {
  const activeStageIndex = workflowStages.findIndex((stage) => stage.id === activeModuleId);

  if (activeStageIndex < 0) {
    return null;
  }

  const visibleStages = workflowStages.slice(
    Math.max(0, activeStageIndex - 1),
    Math.min(workflowStages.length, activeStageIndex + 2),
  );

  return (
    <div className="eval-workflow-strip" aria-label="開發評估流程位置">
      {visibleStages.map((stage) => (
        <span className={stage.id === activeModuleId ? "is-active" : ""} key={stage.id}>
          {stage.label}
        </span>
      ))}
    </div>
  );
}

function ModuleFlowBrief({ module }) {
  const flow = moduleFlowMap[module.id];

  if (!flow) {
    return null;
  }

  const flowGroups = [
    ["前置資料", flow.inputs],
    ["產出結果", flow.outputs],
    ["影響後續", flow.downstream],
  ];

  return (
    <section className="eval-module-flow-brief" aria-label={`${module.title} 流程串接說明`}>
      <div className="eval-module-flow-brief__intro">
        <p className="eval-kicker">FLOW</p>
        <h3>{flow.stage}</h3>
        <p>{flow.summary}</p>
      </div>
      <div className="eval-module-flow-brief__grid">
        {flowGroups.map(([title, items]) => (
          <div className="eval-flow-mini-card" key={title}>
            <strong>{title}</strong>
            <ul>
              {items.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="eval-flow-mini-card eval-flow-mini-card--wide">
          <strong>資料層級與目前狀態</strong>
          <p>
            案件層級：{flow.sharedData.join("、")}。試算 / 版本層級：{flow.versionData.join("、")}。
          </p>
          <p>{flow.mockStatus}</p>
        </div>
      </div>
    </section>
  );
}

function CurrentCaseSummary({ currentCase, compact = false }) {
  if (!currentCase) {
    return (
      <section className={`eval-current-case-card${compact ? " eval-current-case-card--compact" : ""}`}>
        <p className="eval-kicker">CURRENT CASE</p>
        <h4>目前案件尚未選定</h4>
        <p>請先在案件管理建立或選擇案件，後續基地資料、清冊、坪效、成本與報告都會掛在同一個案件底下。</p>
      </section>
    );
  }

  return (
    <section className={`eval-current-case-card${compact ? " eval-current-case-card--compact" : ""}`}>
      <p className="eval-kicker">CURRENT CASE</p>
      <h4>目前案件</h4>
      <dl>
        <div>
          <dt>案件編號</dt>
          <dd>{currentCase.code}</dd>
        </div>
        <div>
          <dt>案件名稱</dt>
          <dd>{currentCase.name}</dd>
        </div>
        <div>
          <dt>開發路徑</dt>
          <dd>{currentCase.path}</dd>
        </div>
        <div>
          <dt>案件狀態</dt>
          <dd>{currentCase.status}</dd>
        </div>
      </dl>
    </section>
  );
}

function CaseDeleteConfirmModal({ deleteConfirmation, onCancel, onContinue, onConfirm }) {
  if (!deleteConfirmation) {
    return null;
  }

  const isSecondStep = deleteConfirmation.step === 2;
  const caseName = deleteConfirmation.caseItem.name || "未命名案件";

  return (
    <div className="eval-confirm-backdrop" role="presentation">
      <section className="eval-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="case-delete-confirm-title">
        <p className="eval-kicker">DELETE CONFIRMATION</p>
        <h4 id="case-delete-confirm-title">{isSecondStep ? "再次確認刪除案件" : "刪除案件確認"}</h4>
        <p>
          {isSecondStep
            ? `請再次確認是否刪除「${caseName}」。刪除後目前案件會被清除，相關清冊與試算資料將無法再掛在此案件底下。`
            : "確定要刪除此案件嗎？此操作會移除目前前端 mock 案件資料，正式版會同步檢查清冊、成本、報告等關聯資料。"}
        </p>
        <div className="eval-confirm-actions">
          <button type="button" className="eval-secondary-action" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="eval-danger-action" onClick={isSecondStep ? onConfirm : onContinue}>
            {isSecondStep ? "確認刪除" : "繼續刪除"}
          </button>
        </div>
      </section>
    </div>
  );
}

function LocalDataClearConfirmModal({ clearConfirmation, onCancel, onContinue, onConfirm }) {
  if (!clearConfirmation) {
    return null;
  }

  const isSecondStep = clearConfirmation.step === 2;

  return (
    <div className="eval-confirm-backdrop" role="presentation">
      <section className="eval-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="local-data-clear-confirm-title">
        <p className="eval-kicker">LOCAL TEST DATA</p>
        <h4 id="local-data-clear-confirm-title">
          {isSecondStep ? "此操作會清除本機測試資料" : "是否清除本機測試資料？"}
        </h4>
        <p>
          {isSecondStep
            ? "此操作會清除本機瀏覽器中的案件、清冊暫存、基地、容積、坪效與後續模組預留資料，無法復原。確認清除？"
            : "目前系統仍為前端測試階段，案件、清冊暫存、基地、容積、坪效與後續模組預留資料會先存在本機瀏覽器。若看到舊版測試案件或需要重新測試，可清除本機測試資料。"}
        </p>
        <div className="eval-confirm-actions">
          <button type="button" className="eval-secondary-action" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="eval-danger-action" onClick={isSecondStep ? onConfirm : onContinue}>
            {isSecondStep ? "確認清除" : "繼續清除"}
          </button>
        </div>
      </section>
    </div>
  );
}

function LocalDataImportConfirmModal({ importConfirmation, onCancel, onContinue, onConfirm }) {
  if (!importConfirmation) {
    return null;
  }

  const isSecondStep = importConfirmation.step === 2;

  return (
    <div className="eval-confirm-backdrop" role="presentation">
      <section className="eval-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="local-data-import-confirm-title">
        <p className="eval-kicker">LOCAL TEST DATA</p>
        <h4 id="local-data-import-confirm-title">
          {isSecondStep ? "匯入後會覆蓋本機測試資料" : "是否匯入本機測試資料？"}
        </h4>
        <p>
          {isSecondStep
            ? "匯入後會覆蓋目前瀏覽器中的案件、清冊暫存、基地、容積、坪效與後續模組預留資料，無法復原。確認匯入？"
            : "匯入後會取代目前瀏覽器中的本機測試資料。這不會影響正式資料庫，因目前尚未接正式資料庫。"}
        </p>
        <div className="eval-confirm-actions">
          <button type="button" className="eval-secondary-action" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="eval-danger-action" onClick={isSecondStep ? onConfirm : onContinue}>
            {isSecondStep ? "確認匯入" : "繼續匯入"}
          </button>
        </div>
      </section>
    </div>
  );
}

function CaseManagementModule({
  accessProfile,
  cases,
  currentCaseId,
  currentCase,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityInputsByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyParamsByCaseId,
  floorEfficiencyResultsByCaseId,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onSelectCase,
  onClearLocalTestData,
  onImportLocalTestData,
}) {
  const [caseForm, setCaseForm] = useState(defaultCaseForm);
  const [editingCaseId, setEditingCaseId] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [clearConfirmation, setClearConfirmation] = useState(null);
  const [importConfirmation, setImportConfirmation] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [localDataMessage, setLocalDataMessage] = useState("");
  const [localDataError, setLocalDataError] = useState("");
  const importFileInputRef = useRef(null);
  const editingCase = cases.find((item) => item.id === editingCaseId) ?? null;

  useEffect(() => {
    if (editingCaseId && !editingCase) {
      setEditingCaseId("");
      setCaseForm(defaultCaseForm);
    }
  }, [editingCase, editingCaseId]);

  const handleChange = (field) => (event) => {
    setCaseForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingCase) {
      onUpdateCase({
        ...editingCase,
        ...normalizeCaseForm(caseForm, editingCase.code || getNextCaseCode(cases)),
      });
      setEditingCaseId("");
      setCaseForm(defaultCaseForm);
      return;
    }

    const createdCase = {
      id: `case-${Date.now()}`,
      ...normalizeCaseForm(caseForm, getNextCaseCode(cases)),
    };

    onAddCase(createdCase);
    setCaseForm(defaultCaseForm);
  };

  const handleEditCase = (caseItem) => {
    setEditingCaseId(caseItem.id);
    setCaseForm(buildCaseFormFromCase(caseItem));
  };

  const handleCancelEdit = () => {
    setEditingCaseId("");
    setCaseForm(defaultCaseForm);
  };

  const handleRequestDelete = (caseItem) => {
    setDeleteConfirmation({ caseItem, step: 1 });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleContinueDelete = () => {
    setDeleteConfirmation((current) => current ? { ...current, step: 2 } : null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) {
      return;
    }

    onDeleteCase(deleteConfirmation.caseItem.id);
    if (editingCaseId === deleteConfirmation.caseItem.id) {
      setEditingCaseId("");
      setCaseForm(defaultCaseForm);
    }
    setDeleteConfirmation(null);
  };

  const handleRequestClearLocalData = () => {
    setClearConfirmation({ step: 1 });
  };

  const handleCancelClearLocalData = () => {
    setClearConfirmation(null);
  };

  const handleContinueClearLocalData = () => {
    setClearConfirmation((current) => current ? { ...current, step: 2 } : null);
  };

  const handleConfirmClearLocalData = () => {
    onClearLocalTestData();
    setEditingCaseId("");
    setCaseForm(defaultCaseForm);
    setDeleteConfirmation(null);
    setClearConfirmation(null);
    setImportConfirmation(null);
    setImportPreview(null);
    setLocalDataError("");
    setLocalDataMessage("已清除本機測試資料。");
  };

  const handleExportLocalTestData = () => {
    const payload = buildLocalTestDataExport({
      cases,
      currentCaseId,
      rosterStagingByCaseId,
      baseInfoByCaseId,
      capacityInputsByCaseId,
      capacityResultsByCaseId,
      floorEfficiencyParamsByCaseId,
      floorEfficiencyResultsByCaseId,
    });

    downloadJsonFile(payload, buildLocalTestDataFileName());
    setLocalDataError("");
    setLocalDataMessage("已匯出本機測試資料。此檔僅供三策開發評估系統測試使用，請勿視為正式案件資料備份。");
  };

  const handleImportFileRequest = () => {
    setLocalDataMessage("");
    setLocalDataError("");
    if (!importFileInputRef.current) {
      setLocalDataError("尚未選擇檔案。");
      return;
    }
    importFileInputRef.current.value = "";
    importFileInputRef.current.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    setLocalDataMessage("");
    setLocalDataError("");
    setImportPreview(null);
    setImportConfirmation(null);

    if (!file) {
      setLocalDataError("尚未選擇檔案。");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      setLocalDataError("檔案不是 .json，請選擇三策測試資料 JSON。");
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(await file.text());
    } catch {
      setLocalDataError("JSON 解析失敗，請確認檔案內容。");
      return;
    }

    const validation = validateLocalTestDataPayload(parsedData);
    if (!validation.ok) {
      setLocalDataError(validation.message);
      return;
    }

    setImportPreview({
      fileName: file.name,
      data: validation.data,
      meta: validation.meta,
      resolvedCurrentCaseId: resolveImportedCurrentCaseId(validation.data.cases, validation.data.currentCaseId),
    });
  };

  const handleRequestImportLocalData = () => {
    if (!importPreview) {
      setLocalDataError("尚未選擇有效的三策測試資料 JSON。");
      return;
    }

    setLocalDataMessage("");
    setLocalDataError("");
    setImportConfirmation({ step: 1 });
  };

  const handleCancelImportLocalData = () => {
    setImportConfirmation(null);
    setLocalDataError("匯入被取消，尚未變更目前本機測試資料。");
  };

  const handleContinueImportLocalData = () => {
    setImportConfirmation((current) => current ? { ...current, step: 2 } : null);
  };

  const handleConfirmImportLocalData = () => {
    if (!importPreview) {
      setImportConfirmation(null);
      setLocalDataError("尚未選擇有效的三策測試資料 JSON。");
      return;
    }

    onImportLocalTestData(importPreview.data);
    setEditingCaseId("");
    setCaseForm(defaultCaseForm);
    setDeleteConfirmation(null);
    setClearConfirmation(null);
    setImportConfirmation(null);
    setLocalDataError("");
    setLocalDataMessage("已匯入本機測試資料。");
  };

  const importSummaryItems = importPreview ? [
    ["檔案名稱", importPreview.fileName],
    ["匯出時間", importPreview.meta.exportedAt || "未提供"],
    ["schemaVersion", importPreview.meta.schemaVersion],
    ["案件數", importPreview.data.cases.length],
    ["有清冊暫存的案件數", Object.keys(importPreview.data.rosterStagingByCaseId).length],
    ["有基地基本資料的案件數", Object.keys(importPreview.data.baseInfoByCaseId).length],
    ["有容積試算資料的案件數", countCaseRecords(importPreview.data.capacityInputsByCaseId, importPreview.data.capacityResultsByCaseId)],
    ["有坪效明細資料的案件數", countCaseRecords(importPreview.data.floorEfficiencyParamsByCaseId, importPreview.data.floorEfficiencyResultsByCaseId)],
    ["有成本資料的案件數", countCaseRecords(importPreview.data.costInputsByCaseId, importPreview.data.costResultsByCaseId)],
    ["有銷售情境資料的案件數", countCaseRecords(importPreview.data.salesScenariosByCaseId)],
    ["有分配資料的案件數", countCaseRecords(importPreview.data.allocationInputsByCaseId, importPreview.data.allocationResultsByCaseId)],
    ["有現金流資料的案件數", countCaseRecords(importPreview.data.cashflowInputsByCaseId, importPreview.data.cashflowResultsByCaseId)],
    ["有銀行報告資料的案件數", countCaseRecords(importPreview.data.bankReportDataByCaseId)],
    ["currentCaseId", importPreview.data.currentCaseId || "未提供"],
    ["匯入後目前案件", importPreview.resolvedCurrentCaseId || "無"],
    ["是否會覆蓋目前本機資料", "是，採覆蓋模式"],
  ] : [];

  return (
    <div className="eval-module-stack">
      <section className="eval-module-section eval-case-flow">
        <div className="eval-section-head">
          <h4>案件是所有資料的入口</h4>
          <p>系統資料先建立案件，再把基地基本資料、土地清冊、建物清冊、坪效、成本、銷售、分配、現金流與銀行報告掛在目前案件底下。</p>
        </div>
        <div className="eval-case-flow-steps">
          {caseDataFlow.map((step, index) => (
            <span key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              {step}
            </span>
          ))}
        </div>
      </section>

      <section className="eval-module-section">
        <div className="eval-section-head">
          <h4>{currentCase ? `目前選取案件：${currentCase.name}` : "目前尚未選取案件"}</h4>
          <p>請從案件列表選定目前案件；土地清冊與建物清冊會依這個案件 context 顯示與匯入。</p>
        </div>
        <CurrentCaseSummary currentCase={currentCase} compact />
      </section>

      <section className="eval-module-section">
        <div className="eval-section-head">
          <h4>{editingCase ? "編輯案件" : "案件列表骨架"}</h4>
          <p>
            {editingCase
              ? `正在編輯：${editingCase.name || "未命名案件"}。儲存後案件列表與目前案件 context 會同步更新。`
              : "目前為前端 mock 資料，正式版本會改由資料庫載入案件、狀態與版本紀錄。"}
          </p>
        </div>
        <form className={`eval-case-form${editingCase ? " is-editing" : ""}`} onSubmit={handleSubmit}>
          <label className="eval-field">
            <span>案件編號</span>
            <input type="text" value={caseForm.code} onChange={handleChange("code")} placeholder="CASE-004" />
          </label>
          <label className="eval-field">
            <span>案件名稱</span>
            <input type="text" value={caseForm.name} onChange={handleChange("name")} placeholder="測試案件名稱" />
          </label>
          <label className="eval-field">
            <span>開發路徑</span>
            <input type="text" value={caseForm.path} onChange={handleChange("path")} placeholder="自主更新 / 前期評估" />
          </label>
          <label className="eval-field">
            <span>案件狀態</span>
            <input type="text" value={caseForm.status} onChange={handleChange("status")} placeholder="評估中" />
          </label>
          <label className="eval-field">
            <span>負責顧問</span>
            <input type="text" value={caseForm.consultant} onChange={handleChange("consultant")} placeholder="待指派" />
          </label>
          <label className="eval-field">
            <span>最後更新</span>
            <input type="text" value={caseForm.updated} onChange={handleChange("updated")} placeholder="2026/05/02" />
          </label>
          <label className="eval-field eval-field--wide">
            <span>版本備註</span>
            <input type="text" value={caseForm.note} onChange={handleChange("note")} placeholder="前端 mock 建立" />
          </label>
          <div className="eval-case-form-actions">
            <button type="submit">{editingCase ? "儲存案件修改" : "新增案件"}</button>
            {editingCase && (
              <button type="button" className="eval-secondary-action" onClick={handleCancelEdit}>
                取消編輯
              </button>
            )}
          </div>
        </form>

        <div className="eval-case-table-wrap">
          <table className="eval-table eval-case-table">
            <thead>
              <tr>
                <th>案件編號</th>
                <th>案件名稱</th>
                <th>開發路徑</th>
                <th>案件狀態</th>
                <th>負責顧問</th>
                <th>最後更新</th>
                <th>版本備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {cases.length ? (
                cases.map((item) => (
                  <tr key={item.id} className={currentCase?.id === item.id ? "is-current-case" : ""}>
                    <td>{item.code}</td>
                    <td>{item.name || "未命名案件"}</td>
                    <td>{item.path}</td>
                    <td>{item.status}</td>
                    <td>{item.consultant}</td>
                    <td>{item.updated}</td>
                    <td>{item.note}</td>
                    <td>
                      <div className="eval-case-actions">
                        <button type="button" className="eval-small-action" onClick={() => onSelectCase(item.id)}>
                          {currentCase?.id === item.id ? "已選定" : "選為目前案件"}
                        </button>
                        <button type="button" className="eval-small-action" onClick={() => handleEditCase(item)}>
                          編輯
                        </button>
                        <button type="button" className="eval-small-action eval-danger-action" onClick={() => handleRequestDelete(item)}>
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <span className="eval-empty-state">目前尚無案件，請先建立案件。</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="eval-module-section eval-local-test-tools">
        <div className="eval-section-head">
          <h4>本機測試資料工具</h4>
          <p>
            目前系統尚未接正式資料庫，案件、清冊暫存、基地、容積、坪效與後續模組預留資料會先保存在本機瀏覽器。可使用 JSON 匯出 / 匯入，在不同電腦之間移轉測試資料。
          </p>
        </div>
        <input
          ref={importFileInputRef}
          className="eval-local-test-file-input"
          type="file"
          accept=".json,application/json"
          onChange={handleImportFileChange}
        />
        <div className="eval-local-test-tools__body">
          <article className="eval-local-test-card">
            <div>
              <strong>匯出本機測試資料</strong>
              <p>下載目前瀏覽器中的案件、清冊暫存、基地、容積、坪效與後續模組預留資料，供其他電腦匯入測試。</p>
            </div>
            <button type="button" onClick={handleExportLocalTestData}>
              匯出本機測試資料
            </button>
          </article>
          <article className="eval-local-test-card">
            <div>
              <strong>匯入本機測試資料</strong>
              <p>匯入先前匯出的三策測試資料 JSON。匯入後會覆蓋目前瀏覽器中的本機測試資料，請先確認檔案來源。</p>
            </div>
            <button type="button" onClick={handleImportFileRequest}>
              選擇 JSON 匯入
            </button>
          </article>
          <article className="eval-local-test-card eval-local-test-card--danger">
            <div>
              <strong>清除本機測試資料</strong>
              <p>僅限三策開發評估系統 localStorage：案件、清冊暫存、基地、容積、坪效與後續模組預留資料；不會清除其他網站資料。</p>
            </div>
            <button type="button" className="eval-danger-action" onClick={handleRequestClearLocalData}>
              清除本機測試資料
            </button>
          </article>
        </div>
        {localDataMessage && <p className="eval-local-test-message">{localDataMessage}</p>}
        {localDataError && <p className="eval-local-test-message eval-local-test-message--error">{localDataError}</p>}
        {importPreview && (
          <div className="eval-import-summary">
            <div>
              <strong>匯入摘要</strong>
              <p>匯入後會取代目前瀏覽器中的本機測試資料。這不會影響正式資料庫，因目前尚未接正式資料庫。</p>
            </div>
            <dl>
              {importSummaryItems.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="eval-danger-action" onClick={handleRequestImportLocalData}>
              匯入本機測試資料
            </button>
          </div>
        )}
      </section>

      <RolePermissionPanel profile={accessProfile} />
      <CaseDeleteConfirmModal
        deleteConfirmation={deleteConfirmation}
        onCancel={handleCancelDelete}
        onContinue={handleContinueDelete}
        onConfirm={handleConfirmDelete}
      />
      <LocalDataClearConfirmModal
        clearConfirmation={clearConfirmation}
        onCancel={handleCancelClearLocalData}
        onContinue={handleContinueClearLocalData}
        onConfirm={handleConfirmClearLocalData}
      />
      <LocalDataImportConfirmModal
        importConfirmation={importConfirmation}
        onCancel={handleCancelImportLocalData}
        onContinue={handleContinueImportLocalData}
        onConfirm={handleConfirmImportLocalData}
      />
    </div>
  );
}

function ModuleSection({ section }) {
  return (
    <section className="eval-module-section">
      <div className="eval-section-head">
        <h4>{section.title}</h4>
        {section.formula && <p>{section.formula}</p>}
        {section.summary && <p>{section.summary}</p>}
      </div>

      {section.fields && (
        <div className="eval-field-grid">
          {section.fields.map((field) => (
            <PlaceholderInput key={field} label={field} />
          ))}
        </div>
      )}

      {section.options && (
        <div className="eval-chip-grid">
          {section.options.map((option) => (
            <span className="eval-chip" key={option}>
              {option}
            </span>
          ))}
        </div>
      )}

      {section.items && (
        <ul className="eval-section-list">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {section.tableColumns && <SkeletonTable columns={section.tableColumns} rows={section.rows} />}
    </section>
  );
}

function DevelopmentPathModule() {
  return (
    <div className="eval-path-grid">
      {developmentPaths.map((path) => (
        <article className="eval-path-card" key={path.title}>
          <div>
            <p>{path.title}</p>
            <span>{path.summary}</span>
          </div>
          <div className="eval-chip-grid">
            {path.tags.map((tag) => (
              <span className="eval-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          {path.children && (
            <div className="eval-subpath">
              {path.children.map((child) => (
                <div key={child.title}>
                  <strong>{child.title}</strong>
                  <ul>
                    {child.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function AssessmentModeCards({ modes }) {
  if (!modes?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-mode-section">
      <div className="eval-section-head">
        <h4>評估模式</h4>
        <p>同一套系統可依案件來源切換資料建立方式，新案從基地條件往後推，進行中案件則從既有條件反推可行性與承接風險。</p>
      </div>
      <div className="eval-mode-grid">
        {modes.map((mode) => (
          <article className="eval-mode-card" key={mode.title}>
            <strong>{mode.title}</strong>
            <p>{mode.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FlowCards({ flows }) {
  if (!flows?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-flow-section">
      <div className="eval-section-head">
        <h4>資料流模式</h4>
        <p>新案與進行中案件採用不同資料流，讓前期評估與承接反推可以共用後續成本、分配、現金流與報告模組。</p>
      </div>
      <div className="eval-flow-grid">
        {flows.map((flow) => (
          <article className="eval-flow-card" key={flow.title}>
            <strong>{flow.title}</strong>
            <div className="eval-flow-steps">
              {flow.steps.map((step, index) => (
                <span key={step}>
                  {step}
                  {index < flow.steps.length - 1 && <b aria-hidden="true">→</b>}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferenceModuleCards({ references }) {
  if (!references?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-reference-section">
      <div className="eval-section-head">
        <h4>引用與回填模組</h4>
        <p>承接評估結果後續會引用或回填至以下模組，保留後續串接正式公式、報表與銀行說明資料的入口。</p>
      </div>
      <div className="eval-reference-grid">
        {references.map((reference) => (
          <span key={reference}>{reference}</span>
        ))}
      </div>
    </section>
  );
}

function RiskChecklist({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-checklist-section">
      <div className="eval-section-head">
        <h4>承接風險檢核</h4>
        <p>先以問題清單標示待確認風險，下一階段再接入正式試算、佐證資料與承接建議。</p>
      </div>
      <div className="eval-checklist">
        {items.map((item) => (
          <label key={item}>
            <input type="checkbox" readOnly />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function OutputSections({ sections }) {
  if (!sections?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-output-section">
      <div className="eval-section-head">
        <h4>反推檢核結果</h4>
        <p>這裡先預留結果欄位，未來會依既有條件反向檢查坪效、成本、銷售、分配、現金流與融資可行性。</p>
      </div>
      <div className="eval-output-grid">
        {sections.map((section) => (
          <article className="eval-output-card" key={section}>
            <span>{section}</span>
            <p>待系統試算後產生判斷</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TakeoverEvaluationModule({ module }) {
  return (
    <div className="eval-module-stack">
      <FlowCards flows={module.flows} />
      <AssessmentModeCards modes={module.modeOptions} />
      <ReferenceModuleCards references={module.references} />
      {module.sections.map((section) => (
        <ModuleSection section={section} key={section.title} />
      ))}
      <RiskChecklist items={module.riskChecklist} />
      <OutputSections sections={module.outputSections} />
    </div>
  );
}

function LicensePrinciples({ module }) {
  return (
    <section className="eval-module-section eval-license-hero">
      <div>
        <p className="eval-kicker">LICENSE RULE</p>
        <h4>第一版授權限制：一個帳號最多綁定 1 台設備</h4>
        <p>
          授權與帳號管理會控管登入、案件建立、模組權限、報告匯出與設備登入資格。第一階段先建立 UI
          與資料欄位骨架，不接正式後端、不做真正設備指紋驗證。
        </p>
      </div>
      <div className="eval-license-rule-card">
        <strong>allowedDeviceCount</strong>
        <span>1</span>
        <p>第二台設備登入時需提示已綁定其他設備，並請使用者聯絡三策管理員解除原設備綁定。</p>
      </div>
    </section>
  );
}

function LicenseListSection({ title, description, items, className = "" }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className={`eval-module-section ${className}`}>
      <div className="eval-section-head">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
      <div className="eval-license-list">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function SecondDeviceWarning({ warning }) {
  if (!warning) {
    return null;
  }

  return (
    <section className="eval-module-section eval-device-warning" data-license-warning>
      <div>
        <p className="eval-kicker">DEVICE LIMIT</p>
        <h4>{warning.title}</h4>
        <p>{warning.description}</p>
      </div>
      <div className="eval-device-warning__actions">
        {warning.actions.map((action) => (
          <button type="button" key={action}>
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}

function LicensePlans({ plans }) {
  if (!plans?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-license-plans">
      <div className="eval-section-head">
        <h4>授權方案骨架</h4>
        <p>以下僅為前端骨架，未寫死為正式商業方案，後續可由管理端調整模組與報告權限。</p>
      </div>
      <div className="eval-plan-grid">
        {plans.map((plan) => (
          <article className="eval-plan-card" key={plan.title}>
            <strong>{plan.title}</strong>
            <ul>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function LicenseManagementModule({ module }) {
  return (
    <div className="eval-module-stack">
      <LicensePrinciples module={module} />
      <LicenseListSection
        title="登入模式說明"
        description="使用者不能自行公開註冊；帳號由三策管理端建立、核發與停用。"
        items={module.loginPrinciples}
        className="eval-login-principles"
      />
      <LicenseListSection
        title="授權影響範圍"
        description="授權狀態會影響系統登入、案件數、模組權限、報告匯出與設備登入資格。"
        items={module.impactAreas}
        className="eval-impact-section"
      />
      {module.sections.map((section) => (
        <ModuleSection section={section} key={section.title} />
      ))}
      <LicenseListSection
        title="設備綁定規則"
        description="第一版主要管控方式為帳號授權 + 單一設備綁定，IP 限制作為輔助。"
        items={module.deviceRules}
        className="eval-device-rules"
      />
      <SecondDeviceWarning warning={module.secondDeviceWarning} />
      <LicenseListSection
        title="管理端功能骨架"
        description="管理端保留帳號、授權、設備、session 與異常登入管理入口。"
        items={module.adminActions}
        className="eval-admin-actions"
      />
      <LicensePlans plans={module.licensePlans} />
    </div>
  );
}

function SecurityOverview({ cards }) {
  if (!cards?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-security-overview">
      <div className="eval-section-head">
        <h4>安全總覽</h4>
        <p>先以狀態卡標示安全控制項目與實作階段，後續再接入正式後端、資料庫規則與稽核紀錄。</p>
      </div>
      <div className="eval-security-status-grid">
        {cards.map((card) => (
          <article className="eval-security-status-card" data-status={card.status} key={card.title}>
            <strong>{card.title}</strong>
            <span>{card.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function SecuritySection({ section }) {
  return (
    <section className="eval-module-section eval-security-section">
      <div className="eval-section-head eval-security-section__head">
        <div>
          <h4>{section.title}</h4>
          {section.fields && <p>預留欄位：{section.fields.join("、")}</p>}
        </div>
        {section.risk && <span className="eval-risk-badge">{section.risk}</span>}
      </div>

      {section.items && (
        <div className="eval-security-check-grid">
          {section.items.map((item) => (
            <label key={item}>
              <input type="checkbox" readOnly />
              <span>{item}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

function SecurityRequirementGroup({ title, items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-security-requirements">
      <div className="eval-section-head">
        <h4>{title}</h4>
      </div>
      <div className="eval-reference-grid">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function SecurityProtectionModule({ module }) {
  return (
    <div className="eval-module-stack">
      <section className="eval-module-section eval-security-hero">
        <p className="eval-kicker">SECURITY PLAN</p>
        <h4>未來正式上線前的安全防護規劃骨架</h4>
        <p>
          此模組只建立前端規劃與資料結構，不接正式後端、不做真正登入驗證、不做真正攻擊阻擋。後續每一項都需要在 API、資料庫與部署環境中落實。
        </p>
      </section>

      <SecurityOverview cards={module.overviewCards} />
      {module.sections.map((section) => (
        <SecuritySection section={section} key={section.title} />
      ))}
      <SecurityRequirementGroup title="已規劃控制項" items={module.plannedControls} />
      <SecurityRequirementGroup title="未來後端需求" items={module.backendRequirements} />
      <SecurityRequirementGroup title="資料庫規則預留表" items={module.databaseRulePlaceholders} />
      <SecurityRequirementGroup title="Audit log 欄位骨架" items={module.auditLogFields} />
    </div>
  );
}

function RosterChipList({ items, className = "" }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className={`eval-roster-chip-list ${className}`}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

const rosterImportSheets = {
  land: "土地清冊_匯入",
  building: "建物清冊_匯入",
  integration: "整合紀錄_匯入",
  allocation: "分配條件_匯入",
};

function formatSequence(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

function normalizeCellValue(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeOwnerName(value) {
  return normalizeCellValue(value).replace(/\s/g, "");
}

function normalizeIdentityCode(value) {
  return normalizeCellValue(value).toUpperCase().replace(/\s/g, "");
}

function isMaskedOwnerValue(value) {
  const text = normalizeCellValue(value);
  return /[*＊ＸX○ＯO]/.test(text) || text.length <= 1;
}

function getFirstMatchingValue(row, keywords) {
  const entry = Object.entries(row).find(([key]) => keywords.some((keyword) => key.includes(keyword)));
  return normalizeCellValue(entry?.[1] ?? "");
}

function getFirstExactHeaderValue(row, headers) {
  const normalizedHeaders = new Set(headers.map((header) => normalizeCellValue(header)));
  const entry = Object.entries(row).find(([key]) => normalizedHeaders.has(normalizeCellValue(key)));
  return normalizeCellValue(entry?.[1] ?? "");
}

function getHeaderValue(row, exactHeaders, fallbackKeywords = exactHeaders) {
  return getFirstExactHeaderValue(row, exactHeaders) || getFirstMatchingValue(row, fallbackKeywords);
}

function formatShareText(numerator, denominator, fallbackValue = "") {
  const normalizedNumerator = normalizeCellValue(numerator);
  const normalizedDenominator = normalizeCellValue(denominator);

  if (!normalizedNumerator && !normalizedDenominator) {
    return normalizeCellValue(fallbackValue);
  }

  return `${normalizedNumerator || "待補"} / ${normalizedDenominator || "待補"}`;
}

function calculateShareArea(areaSqm, numerator, denominator) {
  const ratio = parseRatio(numerator, denominator);
  return Number.isFinite(areaSqm) && Number.isFinite(ratio) ? areaSqm * ratio : null;
}

function getColumnIndex(cellReference = "") {
  const letters = cellReference.replace(/[0-9]/g, "");
  return letters.split("").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function getRowNumber(cellReference = "") {
  const match = cellReference.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function readUint16(view, offset) {
  return view.getUint16(offset, true);
}

function readUint32(view, offset) {
  return view.getUint32(offset, true);
}

async function inflateZipEntry(bytes, method) {
  if (method === 0) {
    return bytes;
  }

  if (method !== 8) {
    throw new Error("目前只支援 ZIP stored / deflate 壓縮格式。");
  }

  if (!("DecompressionStream" in window)) {
    throw new Error("此瀏覽器不支援前端解壓縮，請改用新版 Chrome / Edge，或後續改接 xlsx 解析套件。");
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntries(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let eocdOffset = -1;

  for (let offset = bytes.length - 22; offset >= 0; offset -= 1) {
    if (readUint32(view, offset) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) {
    throw new Error("無法辨識 .xlsx 檔案結構。");
  }

  const entryCount = readUint16(view, eocdOffset + 10);
  let centralOffset = readUint32(view, eocdOffset + 16);
  const entries = new Map();
  const decoder = new TextDecoder("utf-8");

  for (let index = 0; index < entryCount; index += 1) {
    if (readUint32(view, centralOffset) !== 0x02014b50) {
      break;
    }

    const method = readUint16(view, centralOffset + 10);
    const compressedSize = readUint32(view, centralOffset + 20);
    const fileNameLength = readUint16(view, centralOffset + 28);
    const extraLength = readUint16(view, centralOffset + 30);
    const commentLength = readUint16(view, centralOffset + 32);
    const localHeaderOffset = readUint32(view, centralOffset + 42);
    const fileName = decoder.decode(bytes.slice(centralOffset + 46, centralOffset + 46 + fileNameLength));

    const localNameLength = readUint16(view, localHeaderOffset + 26);
    const localExtraLength = readUint16(view, localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedBytes = bytes.slice(dataOffset, dataOffset + compressedSize);
    entries.set(fileName.replace(/\\/g, "/"), { method, compressedBytes });

    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

async function readZipText(entries, path) {
  const entry = entries.get(path);
  if (!entry) {
    return "";
  }

  const inflated = await inflateZipEntry(entry.compressedBytes, entry.method);
  return new TextDecoder("utf-8").decode(inflated);
}

function parseXml(text) {
  return new DOMParser().parseFromString(text, "application/xml");
}

function parseRelationships(xmlText) {
  if (!xmlText) {
    return new Map();
  }

  const xml = parseXml(xmlText);
  return new Map(
    Array.from(xml.getElementsByTagName("Relationship")).map((relationship) => [
      relationship.getAttribute("Id"),
      relationship.getAttribute("Target"),
    ]),
  );
}

function resolveWorkbookTarget(target = "") {
  const normalized = target.replace(/^\/+/, "");
  return normalized.startsWith("xl/") ? normalized : `xl/${normalized}`;
}

function parseSharedStrings(xmlText) {
  if (!xmlText) {
    return [];
  }

  const xml = parseXml(xmlText);
  return Array.from(xml.getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t")).map((node) => node.textContent ?? "").join(""),
  );
}

function getCellText(cell, sharedStrings) {
  const type = cell.getAttribute("t");

  if (type === "inlineStr") {
    return Array.from(cell.getElementsByTagName("t")).map((node) => node.textContent ?? "").join("");
  }

  const value = cell.getElementsByTagName("v")[0]?.textContent ?? "";
  if (type === "s") {
    return sharedStrings[Number(value)] ?? "";
  }

  return value;
}

function parseSheetRows(xmlText, sharedStrings) {
  if (!xmlText) {
    return [];
  }

  const xml = parseXml(xmlText);
  return Array.from(xml.getElementsByTagName("row")).map((row) => {
    const values = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      values[getColumnIndex(cell.getAttribute("r") ?? "")] = normalizeCellValue(getCellText(cell, sharedStrings));
    });
    return {
      excelRowNumber: Number(row.getAttribute("r")) || getRowNumber(row.getElementsByTagName("c")[0]?.getAttribute("r") ?? ""),
      values,
    };
  });
}

function scoreHeaderRow(values, sheetType) {
  const joined = values.join("|");
  const commonScore = ["地主", "姓名", "所有權", "備註"].filter((keyword) => joined.includes(keyword)).length;
  const landScore = ["地號", "土地", "持分", "權利範圍"].filter((keyword) => joined.includes(keyword)).length;
  const buildingScore = ["建號", "建物", "門牌", "對應地號"].filter((keyword) => joined.includes(keyword)).length;
  return commonScore + (sheetType === "land" ? landScore : buildingScore);
}

function rowsToObjects(rows, sheetType) {
  const headerIndex = rows.findIndex((row) => scoreHeaderRow(row.values, sheetType) >= 2);
  if (headerIndex < 0) {
    return [];
  }

  const headers = rows[headerIndex].values.map((header, index) => normalizeCellValue(header) || `欄位${index + 1}`);
  return rows.slice(headerIndex + 1)
    .map((row) => {
      const item = { __rowNumber: row.excelRowNumber };
      headers.forEach((header, index) => {
        item[header] = row.values[index] ?? "";
      });
      return item;
    })
    .filter((row) => Object.entries(row).some(([key, value]) => key !== "__rowNumber" && normalizeCellValue(value)));
}

async function parseRosterWorkbook(file) {
  const entries = await readZipEntries(await file.arrayBuffer());
  const workbookXml = await readZipText(entries, "xl/workbook.xml");
  const workbookRels = parseRelationships(await readZipText(entries, "xl/_rels/workbook.xml.rels"));
  const sharedStrings = parseSharedStrings(await readZipText(entries, "xl/sharedStrings.xml"));
  const workbook = parseXml(workbookXml);
  const sheets = new Map();

  Array.from(workbook.getElementsByTagName("sheet")).forEach((sheet) => {
    const name = sheet.getAttribute("name") ?? "";
    const relationshipId = sheet.getAttribute("r:id");
    const target = workbookRels.get(relationshipId);
    if (name && target) {
      sheets.set(name, resolveWorkbookTarget(target));
    }
  });

  const readSheet = async (sheetName, sheetType) => {
    const path = sheets.get(sheetName);
    const xml = path ? await readZipText(entries, path) : "";
    return rowsToObjects(parseSheetRows(xml, sharedStrings), sheetType);
  };

  return {
    availableSheets: Array.from(sheets.keys()),
    landRows: await readSheet(rosterImportSheets.land, "land"),
    buildingRows: await readSheet(rosterImportSheets.building, "building"),
    integrationFound: sheets.has(rosterImportSheets.integration),
    allocationFound: sheets.has(rosterImportSheets.allocation),
  };
}

function buildLandRightRows(rows) {
  const mappedRows = rows.map((row) => {
    const landAreaRaw = getHeaderValue(row, ["土地面積㎡", "土地面積"], ["土地面積", "面積"]);
    const landAreaSqm = parseRosterNumber(landAreaRaw);
    const excelLandAreaPing = getFirstExactHeaderValue(row, ["土地面積坪"]);
    const shareNumerator = getFirstExactHeaderValue(row, ["持分分子"]);
    const shareDenominator = getFirstExactHeaderValue(row, ["持分分母"]);
    const excelShareRatio = getFirstExactHeaderValue(row, ["持分比例"]);
    const excelShareAreaPing = getFirstExactHeaderValue(row, ["持分面積坪"]);
    const calculatedShareRatio = parseRatio(shareNumerator, shareDenominator);
    const calculatedShareAreaSqm = calculateShareArea(landAreaSqm, shareNumerator, shareDenominator);
    const ownerName = getFirstMatchingValue(row, ["地主姓名", "所有權人", "姓名", "名稱"]);
    const landNumber = getFirstMatchingValue(row, ["地號"]);

    return {
      sourceRowNumber: row.__rowNumber,
      ownerReferenceId: getFirstMatchingValue(row, ["地主編號", "權利人編號", "所有權人編號", "參考編號"]),
      ownerName,
      maskedIdentityCode: getFirstMatchingValue(row, ["身分證", "統編", "統一編號", "證號", "識別碼", "前碼"]),
      address: getFirstMatchingValue(row, ["地址", "通訊地址", "戶籍地址", "住址"]),
      landNumber,
      landAreaRaw,
      landAreaSqm: roundForStorage(landAreaSqm, INTERNAL_DECIMAL_DIGITS),
      excelLandAreaPing,
      shareNumerator,
      shareDenominator,
      excelShareRatio,
      excelShareAreaPing,
      calculatedShareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
      calculatedShareAreaSqm: roundForStorage(calculatedShareAreaSqm, INTERNAL_DECIMAL_DIGITS),
      calculatedShareAreaPing: roundForStorage(sqmToPing(calculatedShareAreaSqm), INTERNAL_DECIMAL_DIGITS),
      landArea: getFirstMatchingValue(row, ["土地面積", "面積"]),
      announcedCurrentValue: getFirstMatchingValue(row, ["公告現值"]),
      announcedLandValue: getFirstMatchingValue(row, ["公告地價"]),
      shareText: getFirstMatchingValue(row, ["權利範圍", "持分"]),
      convertedShare: getFirstMatchingValue(row, ["換算持分", "持分比例", "持分面積"]),
      contactStatus: getFirstMatchingValue(row, ["聯絡狀態", "聯絡"]),
      consentStatus: getFirstMatchingValue(row, ["同意狀態", "同意"]),
      contractStatus: getFirstMatchingValue(row, ["簽約狀態", "簽約"]),
      note: getFirstMatchingValue(row, ["備註", "說明"]),
      validationStatus: ownerName && landNumber ? "可建立疑似群組" : "待人工確認",
    };
  });

  const enrichedRows = mappedRows.map((row) => ({
    ...row,
    landArea: row.landAreaRaw || row.landArea,
    shareText: formatShareText(row.shareNumerator, row.shareDenominator, row.shareText),
    convertedShare: Number.isFinite(row.calculatedShareRatio)
      ? String(row.calculatedShareRatio)
      : row.convertedShare,
  }));

  return enrichedRows
    .filter((row) => [
      row.ownerReferenceId,
      row.ownerName,
      row.maskedIdentityCode,
      row.landNumber,
      row.landArea,
      row.shareText,
      row.convertedShare,
    ].some(Boolean))
    .map((row, index) => ({
      ...row,
      landRightRowId: formatSequence("LR", index),
    }));
}

function buildBuildingRightRows(rows) {
  const mappedRows = rows.map((row) => {
    const buildingAreaRaw = getHeaderValue(row, ["建物面積㎡", "建物面積"], ["建物面積", "面積"]);
    const buildingAreaSqm = parseRosterNumber(buildingAreaRaw);
    const excelBuildingAreaPing = getFirstExactHeaderValue(row, ["建物面積坪"]);
    const shareNumerator = getFirstExactHeaderValue(row, ["持分分子"]);
    const shareDenominator = getFirstExactHeaderValue(row, ["持分分母"]);
    const excelShareRatio = getFirstExactHeaderValue(row, ["持分比例"]);
    const excelShareAreaSqm = getFirstExactHeaderValue(row, ["建物持分面積㎡"]);
    const calculatedShareRatio = parseRatio(shareNumerator, shareDenominator);
    const calculatedShareAreaSqm = calculateShareArea(buildingAreaSqm, shareNumerator, shareDenominator);
    const ownerName = getFirstMatchingValue(row, ["地主姓名", "所有權人", "姓名", "名稱"]);
    const buildingNumber = getFirstMatchingValue(row, ["建號"]);

    return {
      sourceRowNumber: row.__rowNumber,
      ownerReferenceId: getFirstMatchingValue(row, ["地主編號", "權利人編號", "所有權人編號", "參考編號"]),
      ownerName,
      maskedIdentityCode: getFirstMatchingValue(row, ["身分證", "統編", "統一編號", "證號", "識別碼", "前碼"]),
      relatedLandNumber: getFirstMatchingValue(row, ["對應地號", "地號"]),
      buildingNumber,
      address: getFirstMatchingValue(row, ["門牌", "地址"]),
      buildingAreaRaw,
      buildingAreaSqm: roundForStorage(buildingAreaSqm, INTERNAL_DECIMAL_DIGITS),
      excelBuildingAreaPing,
      shareNumerator,
      shareDenominator,
      excelShareRatio,
      excelShareAreaSqm,
      calculatedShareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
      calculatedShareAreaSqm: roundForStorage(calculatedShareAreaSqm, INTERNAL_DECIMAL_DIGITS),
      calculatedShareAreaPing: roundForStorage(sqmToPing(calculatedShareAreaSqm), INTERNAL_DECIMAL_DIGITS),
      buildingArea: getFirstMatchingValue(row, ["建物面積", "面積"]),
      shareText: getFirstMatchingValue(row, ["權利範圍", "持分"]),
      note: getFirstMatchingValue(row, ["備註", "說明"]),
      validationStatus: ownerName && buildingNumber ? "可建立疑似群組" : "待人工確認",
    };
  });

  const enrichedRows = mappedRows.map((row) => ({
    ...row,
    buildingArea: row.buildingAreaRaw || row.buildingArea,
    shareText: formatShareText(row.shareNumerator, row.shareDenominator, row.shareText),
  }));

  return enrichedRows
    .filter((row) => [
      row.ownerReferenceId,
      row.ownerName,
      row.maskedIdentityCode,
      row.relatedLandNumber,
      row.buildingNumber,
      row.address,
      row.buildingArea,
      row.shareText,
    ].some(Boolean))
    .map((row, index) => ({
      ...row,
      buildingRightRowId: formatSequence("BR", index),
    }));
}

function createRosterIssue(type, severity, message, rows = []) {
  return {
    id: `${type}-${rows.join("-") || Math.random().toString(36).slice(2)}`,
    type,
    severity,
    message,
    rows,
  };
}

function buildPartyPreview(landRights, buildingRights) {
  const issues = [];
  const landNumbers = new Set(landRights.map((row) => row.landNumber).filter(Boolean));
  const suspectedGroups = new Map();
  const namesByReference = new Map();
  const rowsByIdentity = new Map();
  const rowsByOwnerName = new Map();

  [...landRights, ...buildingRights].forEach((row) => {
    const ownerName = normalizeOwnerName(row.ownerName);
    const referenceId = normalizeCellValue(row.ownerReferenceId);
    const identityCode = normalizeIdentityCode(row.maskedIdentityCode);
    const rowId = row.landRightRowId ?? row.buildingRightRowId;

    if (!ownerName) {
      issues.push(createRosterIssue(
        row.landRightRowId ? "土地缺少姓名" : "建物缺少姓名",
        "高",
        row.landRightRowId ? "土地權利列缺少地主姓名，無法歸戶。" : "建物權利列缺少地主姓名，無法歸戶。",
        [rowId],
      ));
      return;
    }

    if (!rowsByOwnerName.has(ownerName)) {
      rowsByOwnerName.set(ownerName, { landRows: [], buildingRows: [], references: new Set(), landNumbers: new Set(), buildingNumbers: new Set() });
    }
    const nameGroup = rowsByOwnerName.get(ownerName);
    if (referenceId) nameGroup.references.add(referenceId);
    if (row.landRightRowId) {
      nameGroup.landRows.push(row.landRightRowId);
      if (row.landNumber) nameGroup.landNumbers.add(row.landNumber);
    }
    if (row.buildingRightRowId) {
      nameGroup.buildingRows.push(row.buildingRightRowId);
      if (row.buildingNumber) nameGroup.buildingNumbers.add(row.buildingNumber);
    }

    const groupKey = [
      `name:${ownerName}`,
      identityCode ? `id:${identityCode}` : "",
      row.address ? `address:${normalizeOwnerName(row.address)}` : "",
    ].filter(Boolean).join("|");

    if (!suspectedGroups.has(groupKey)) {
      suspectedGroups.set(groupKey, {
        name: row.ownerName,
        maskedNames: new Set(),
        landRows: [],
        buildingRows: [],
        references: new Set(),
        identityCodes: new Set(),
        addresses: new Set(),
        notes: new Set(),
        landNumbers: new Set(),
        buildingNumbers: new Set(),
      });
    }

    const group = suspectedGroups.get(groupKey);
    group.maskedNames.add(row.ownerName);
    if (row.landRightRowId) {
      group.landRows.push(row.landRightRowId);
      if (row.landNumber) group.landNumbers.add(row.landNumber);
    }
    if (row.buildingRightRowId) {
      group.buildingRows.push(row.buildingRightRowId);
      if (row.buildingNumber) group.buildingNumbers.add(row.buildingNumber);
    }
    if (identityCode) {
      group.identityCodes.add(identityCode);
      if (!rowsByIdentity.has(identityCode)) {
        rowsByIdentity.set(identityCode, { names: new Set(), rows: [] });
      }
      rowsByIdentity.get(identityCode).names.add(ownerName);
      rowsByIdentity.get(identityCode).rows.push(rowId);
    }
    if (row.address) group.addresses.add(row.address);
    if (row.note) group.notes.add(row.note);
    if (referenceId) {
      group.references.add(referenceId);
      if (!namesByReference.has(referenceId)) {
        namesByReference.set(referenceId, new Set());
      }
      namesByReference.get(referenceId).add(ownerName);
    }
  });

  rowsByOwnerName.forEach((group) => {
    if (group.references.size > 1) {
      issues.push(createRosterIssue("同姓名不同參考編號", "中", "同姓名不同參考編號，建議人工確認是否同一權利人。", [...group.landRows, ...group.buildingRows]));
    }
    if (group.landNumbers.size > 1) {
      issues.push(createRosterIssue("同姓名多地號", "中", "疑似同姓或遮蔽姓名相似，涉及多筆地號，需人工確認是否同一權利人。", group.landRows));
    }
    if (group.buildingNumbers.size > 1) {
      issues.push(createRosterIssue("同姓名多建號", "中", "疑似同姓或遮蔽姓名相似，涉及多筆建號，需人工確認是否同一權利人。", group.buildingRows));
    }
  });

  rowsByIdentity.forEach((identityGroup, identityCode) => {
    if (identityGroup.rows.length > 1) {
      issues.push(createRosterIssue(
        "部分識別碼相符",
        "中",
        `部分識別碼「${identityCode}」出現在多筆權利列，只能作為疑似比對依據，不能直接確認為同一人。`,
        identityGroup.rows,
      ));
    }
  });

  namesByReference.forEach((names, referenceId) => {
    if (names.size > 1) {
      issues.push(createRosterIssue(
        "同編號不同姓名",
        "高",
        `同一參考編號「${referenceId}」對應不同姓名，請檢查原始清冊。`,
        [],
      ));
    }
  });

  buildingRights.forEach((row) => {
    if (row.buildingNumber && !row.relatedLandNumber) {
      issues.push(createRosterIssue("建物缺對應地號", "中", "建物缺少對應地號，後續土地 / 建物串接可能失敗。", [row.buildingRightRowId]));
    }
    if (row.relatedLandNumber && !landNumbers.has(row.relatedLandNumber)) {
      issues.push(createRosterIssue("建物地號未匹配", "中", "建物對應地號未出現在土地清冊。", [row.buildingRightRowId]));
    }
  });

  const partyRows = Array.from(suspectedGroups.values()).map((group, index) => {
    const reasons = [];
    const totalRows = group.landRows.length + group.buildingRows.length;
    const hasMaskedName = Array.from(group.maskedNames).some((name) => isMaskedOwnerValue(name));
    let confidence = "未歸戶";

    if (totalRows === 1) {
      reasons.push("單筆權利列先保留為原始資料，尚未進行正式歸戶。");
    }
    if (group.references.size > 1) {
      reasons.push("同姓名不同參考編號，建議人工確認是否同一權利人。");
      confidence = "待人工確認";
    }
    if (group.identityCodes.size && totalRows > 1) {
      reasons.push("部分識別碼相符，僅能作為疑似比對線索。");
      confidence = confidence === "待人工確認" ? confidence : "部分識別碼相符";
    }
    if (group.landNumbers.size > 1) {
      reasons.push("疑似同姓或遮蔽姓名相似，涉及多筆地號。");
      confidence = confidence === "待人工確認" || confidence === "部分識別碼相符" ? confidence : "疑似同姓";
    }
    if (group.buildingNumbers.size > 1) {
      reasons.push("疑似同姓或遮蔽姓名相似，涉及多筆建號。");
      confidence = confidence === "待人工確認" || confidence === "部分識別碼相符" ? confidence : "疑似同姓";
    }
    if (totalRows > 1 && hasMaskedName) {
      reasons.push("資料疑似來自第二類謄本或遮蔽姓名，不能直接完成正式歸戶。");
      confidence = confidence === "未歸戶" ? "疑似同姓" : confidence;
    }
    if (totalRows > 1 && group.identityCodes.size === 1 && (group.addresses.size === 1 || group.references.size === 1)) {
      reasons.push("遮蔽姓名、部分識別碼與輔助資訊一致，屬高度疑似但仍需人工確認。");
      confidence = "高度疑似同一人";
    }

    return {
      partyGroupId: formatSequence("PG", index),
      name: group.name,
      ownerReferenceIds: Array.from(group.references),
      maskedIdentityCodes: Array.from(group.identityCodes),
      landRightRowIds: group.landRows,
      buildingRightRowIds: group.buildingRows,
      landNumbers: Array.from(group.landNumbers),
      buildingNumbers: Array.from(group.buildingNumbers),
      confidence,
      status: confidence,
      reasons,
    };
  });

  return { partyRows, issues };
}

function buildLandShareTotalIssues(landRights) {
  const sharesByLandNumber = new Map();

  landRights.forEach((row) => {
    const landNumber = normalizeCellValue(row.landNumber);
    const shareRatio = parseRatio(row.shareNumerator, row.shareDenominator);

    if (!landNumber || !Number.isFinite(shareRatio)) {
      return;
    }

    const group = sharesByLandNumber.get(landNumber) ?? {
      totalShareRatio: 0,
      rowIds: [],
    };

    group.totalShareRatio += shareRatio;
    group.rowIds.push(row.landRightRowId);
    sharesByLandNumber.set(landNumber, group);
  });

  return Array.from(sharesByLandNumber.entries()).flatMap(([landNumber, group]) => {
    const difference = Math.abs(group.totalShareRatio - 1);

    if (difference <= SHARE_TOTAL_TOLERANCE) {
      return [];
    }

    return createRosterIssue(
      "地號持分合計待確認",
      "中",
      `地號「${landNumber}」持分合計為 ${formatNumber(group.totalShareRatio, 6)}，與 1 的差距超過 ${SHARE_TOTAL_TOLERANCE}，請人工確認原始分子 / 分母。`,
      group.rowIds.filter(Boolean),
    );
  });
}

function buildRosterPreview(file, workbookData) {
  const landRights = buildLandRightRows(workbookData.landRows);
  const buildingRights = buildBuildingRightRows(workbookData.buildingRows);
  const { partyRows, issues: partyIssues } = buildPartyPreview(landRights, buildingRights);
  const shareTotalIssues = buildLandShareTotalIssues(landRights);
  const issues = [...partyIssues, ...shareTotalIssues];
  const landNumbers = new Set(landRights.map((row) => row.landNumber).filter(Boolean));
  const buildingNumbers = new Set(buildingRights.map((row) => row.buildingNumber).filter(Boolean));
  const batchId = `IMPORT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`;

  return {
    batchId,
    importBatchId: batchId,
    version: "TEMP-V001",
    fileName: file.name,
    importedAt: new Date().toLocaleString("zh-TW", { hour12: false }),
    availableSheets: workbookData.availableSheets,
    integrationFound: workbookData.integrationFound,
    allocationFound: workbookData.allocationFound,
    landRights,
    landRows: landRights,
    buildingRights,
    buildingRows: buildingRights,
    partyRows,
    partyGroups: partyRows,
    issues,
    summary: {
      landCount: landRights.length,
      buildingCount: buildingRights.length,
      partyCount: partyRows.length,
      landNumberCount: landNumbers.size,
      buildingNumberCount: buildingNumbers.size,
      sameNameMultiLandCount: partyRows.filter((party) => party.landNumbers.length > 1).length,
      sameNameMultiBuildingCount: partyRows.filter((party) => party.buildingNumbers.length > 1).length,
      manualReviewCount: partyRows.filter((party) => !["已人工確認", "已完整資料確認"].includes(party.status)).length + issues.length,
      warningCount: issues.length,
    },
  };
}

function RosterPreviewTable({ title, description, emptyText, columns, rows }) {
  return (
    <section className="eval-module-section">
      <div className="eval-section-head">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
      {rows.length ? (
        <div className="eval-table-wrap eval-roster-preview-scroll">
          <table className="eval-table eval-roster-preview-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${row[columns[0].key] || index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>{Array.isArray(row[column.key]) ? row[column.key].join("、") || "未填" : row[column.key] || "未填"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="eval-roster-empty">{emptyText}</p>
      )}
    </section>
  );
}

function getRosterLandRows(rosterStaging) {
  return rosterStaging?.landRights ?? rosterStaging?.landRows ?? [];
}

function parseRosterNumber(value) {
  return parsePrecisionNumber(value);
}

function formatAreaSummary(value) {
  return formatSqmAndPing(value);
}

function buildRosterBaseSummary(rosterStaging) {
  const landRows = getRosterLandRows(rosterStaging);
  const landByNumber = new Map();

  landRows.forEach((row) => {
    const landNumber = normalizeCellValue(row.landNumber);
    if (landNumber && !landByNumber.has(landNumber)) {
      landByNumber.set(landNumber, row);
    }
  });

  const uniqueLandRows = Array.from(landByNumber.values());
  const landNumbers = Array.from(landByNumber.keys());
  const areaValues = uniqueLandRows.map((row) => pickNumericValue(
    row.landAreaSqm,
    parseRosterNumber(row.landAreaRaw),
    parseRosterNumber(row.landArea),
  ));
  const canSumArea = areaValues.length > 0 && areaValues.every((value) => Number.isFinite(value));
  const areaTotal = canSumArea
    ? roundForStorage(areaValues.reduce((total, value) => total + value, 0), INTERNAL_DECIMAL_DIGITS)
    : null;
  const announcedCurrentValueCount = uniqueLandRows.filter((row) => normalizeCellValue(row.announcedCurrentValue)).length;
  const announcedLandValueCount = uniqueLandRows.filter((row) => normalizeCellValue(row.announcedLandValue)).length;
  const assessedCurrentValueSummary = buildAssessedCurrentValueSummary(rosterStaging);

  return {
    hasRoster: Boolean(rosterStaging),
    fileName: rosterStaging?.fileName ?? "",
    importedAt: rosterStaging?.importedAt ?? "",
    landRightCount: landRows.length,
    landNumberCount: landNumbers.length,
    landNumbers,
    landNumberDisplay: landNumbers.length > 5
      ? `${landNumbers.slice(0, 5).join("、")}…共 ${landNumbers.length} 筆`
      : landNumbers.join("、") || "待清冊補齊",
    landAreaSqm: areaTotal,
    landAreaSummary: areaTotal === null ? "待清冊補齊" : formatAreaSummary(areaTotal),
    assessedCurrentValueTotal: assessedCurrentValueSummary.assessedCurrentValueTotal,
    assessedCurrentValueWeightedUnit: assessedCurrentValueSummary.assessedCurrentValueWeightedUnit,
    assessedCurrentValueByLot: assessedCurrentValueSummary.assessedCurrentValueByLot,
    assessedCurrentValueSourceStatus: assessedCurrentValueSummary.assessedCurrentValueSourceStatus,
    announcedCurrentValueStatus: assessedCurrentValueSummary.assessedCurrentValueSourceStatus,
    announcedLandValueStatus: announcedLandValueCount
      ? `清冊已提供 ${announcedLandValueCount} 筆地號資料`
      : "清冊未提供",
  };
}

function buildAssessedCurrentValueSummary(rosterStaging) {
  const landRows = getRosterLandRows(rosterStaging);
  const landByNumber = new Map();
  const conflictLandNumbers = new Set();

  landRows.forEach((row) => {
    const landNumber = normalizeCellValue(row.landNumber);
    if (!landNumber) {
      return;
    }

    const landAreaSqm = pickNumericValue(
      row.landAreaSqm,
      parseRosterNumber(row.landAreaRaw),
      parseRosterNumber(row.landArea),
    );
    const assessedCurrentValueUnit = parseRosterNumber(row.announcedCurrentValue);
    const existing = landByNumber.get(landNumber);

    if (existing) {
      const areaDiffers = Number.isFinite(existing.landAreaSqm)
        && Number.isFinite(landAreaSqm)
        && Math.abs(existing.landAreaSqm - landAreaSqm) > 0.000001;
      const unitDiffers = Number.isFinite(existing.assessedCurrentValueUnit)
        && Number.isFinite(assessedCurrentValueUnit)
        && Math.abs(existing.assessedCurrentValueUnit - assessedCurrentValueUnit) > 0.000001;

      if (areaDiffers || unitDiffers) {
        conflictLandNumbers.add(landNumber);
      }
      return;
    }

    landByNumber.set(landNumber, {
      landNumber,
      landAreaSqm,
      assessedCurrentValueUnit,
    });
  });

  const assessedCurrentValueByLot = Array.from(landByNumber.values())
    .map((lot) => ({
      ...lot,
      assessedCurrentValueSubtotal: Number.isFinite(lot.landAreaSqm) && Number.isFinite(lot.assessedCurrentValueUnit)
        ? lot.landAreaSqm * lot.assessedCurrentValueUnit
        : null,
    }))
    .sort((a, b) => Number(a.landNumber) - Number(b.landNumber));
  const completeLotCount = assessedCurrentValueByLot.filter((lot) => (
    Number.isFinite(lot.landAreaSqm) && Number.isFinite(lot.assessedCurrentValueUnit)
  )).length;
  const providedLotCount = assessedCurrentValueByLot.filter((lot) => Number.isFinite(lot.assessedCurrentValueUnit)).length;
  const assessedCurrentValueTotal = completeLotCount
    ? assessedCurrentValueByLot.reduce((total, lot) => (
      total + (Number.isFinite(lot.assessedCurrentValueSubtotal) ? lot.assessedCurrentValueSubtotal : 0)
    ), 0)
    : null;
  const landAreaTotal = assessedCurrentValueByLot.reduce((total, lot) => (
    total + (Number.isFinite(lot.landAreaSqm) ? lot.landAreaSqm : 0)
  ), 0);
  const assessedCurrentValueWeightedUnit = Number.isFinite(assessedCurrentValueTotal) && landAreaTotal > 0
    ? assessedCurrentValueTotal / landAreaTotal
    : null;
  const assessedCurrentValueSourceStatus = (() => {
    if (!assessedCurrentValueByLot.length || !providedLotCount) {
      return "清冊未提供";
    }
    if (conflictLandNumbers.size) {
      return "需人工確認";
    }
    if (completeLotCount !== assessedCurrentValueByLot.length) {
      return "部分地號缺漏";
    }
    return `清冊已提供 ${completeLotCount} 筆地號資料`;
  })();

  return roundRecordNumbers({
    assessedCurrentValueTotal,
    assessedCurrentValueWeightedUnit,
    assessedCurrentValueByLot,
    assessedCurrentValueSourceStatus,
  }, INTERNAL_DECIMAL_DIGITS);
}

function getEffectiveCapacityInputs(capacityInputs, baseInfo) {
  return {
    ...defaultCapacityInputs,
    ...capacityInputs,
    baseFloorAreaRatio: capacityInputs?.baseFloorAreaRatio || baseInfo?.baseFloorAreaRatio || "",
    tdrRecipientFloorAreaRatio: capacityInputs?.tdrRecipientFloorAreaRatio || capacityInputs?.baseFloorAreaRatio || baseInfo?.baseFloorAreaRatio || "",
    tdrScoring: {
      ...defaultTdrScoringInputs,
      ...(isPlainRecord(capacityInputs?.tdrScoring) ? capacityInputs.tdrScoring : {}),
    },
  };
}

function pickNumericValue(...values) {
  for (const value of values) {
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function parseRateInput(value, fallbackValue = null) {
  const parsedValue = parseNumericInput(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function parsePlainNumberInput(value, fallbackValue = null) {
  const parsedValue = parseNumericInput(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function clampScore(value, min, max, fallbackValue = 0) {
  const parsedValue = parseNumericInput(value);
  if (!Number.isFinite(parsedValue)) {
    return fallbackValue;
  }

  return Math.min(Math.max(parsedValue, min), max);
}

function mapOptionScore(value, scoreMap, fallbackValue = 0) {
  return Object.prototype.hasOwnProperty.call(scoreMap, value) ? scoreMap[value] : fallbackValue;
}

function classifyTdrSiteArea(landAreaSqm) {
  if (!Number.isFinite(landAreaSqm)) {
    return "待補資料";
  }

  if (landAreaSqm < 500) {
    return "未達 500㎡";
  }
  if (landAreaSqm < 1500) {
    return "500㎡以上，未達 1,500㎡：甲一";
  }
  if (landAreaSqm < 2000) {
    return "1,500㎡以上，未達 2,000㎡：甲二";
  }
  if (landAreaSqm < 4000) {
    return "2,000㎡以上，未達 4,000㎡：甲三";
  }
  if (landAreaSqm < 6000) {
    return "4,000㎡以上，未達 6,000㎡：甲四";
  }
  if (landAreaSqm < 10000) {
    return "6,000㎡以上，未達 10,000㎡：甲五";
  }

  return "10,000㎡以上：甲六";
}

function calculateTdrRoadPrecheck(roadWidthMeters, targetTransferRatio) {
  if (!Number.isFinite(roadWidthMeters)) {
    return {
      score: null,
      percentage: null,
      status: "資料不足，請輸入接受基地連接道路寬度。",
      targetNotice: "請先補齊道路寬度，再檢核目標容移比例。",
      missing: true,
    };
  }

  if (roadWidthMeters < 8) {
    return {
      score: 0,
      percentage: 0,
      status: "未達 8 公尺，需確認是否符合容積移轉接受基地條件。",
      targetNotice: "臨路條件初判為 0%，是否可辦理容積移轉仍須主管機關審查確認。",
      missing: false,
    };
  }

  const score = roadWidthMeters < 20 ? roadWidthMeters : 20;
  const status = roadWidthMeters < 20
    ? "8 公尺以上未達 20 公尺者，最高可移入容積以道路寬度數值作為接受基地基準容積百分比；正式仍依審查確認。"
    : "接受基地連接寬度 20 公尺以上道路者，可移入容積不得超過接受基地基準容積之 20%；正式仍依審查確認。";
  const targetNotice = Number.isFinite(targetTransferRatio)
    ? `目前容移比例 ${formatPercentValue(targetTransferRatio)} 為前期試算目標；臨路條件初判為 ${formatPercentValue(score)}，是否可達 ${formatPercentValue(targetTransferRatio)} 仍須搭配量體評點、接受基地條件及主管機關審查確認。`
    : `臨路條件初判為 ${formatPercentValue(score)}；目標容移比例待補資料。`;

  return {
    score,
    percentage: score,
    status,
    targetNotice,
    missing: false,
  };
}

function calculateTdrScoringSummary(baseInfo, capacityInputs, capacityResultSeed) {
  const scoringInputs = {
    ...defaultTdrScoringInputs,
    ...(isPlainRecord(capacityInputs?.tdrScoring) ? capacityInputs.tdrScoring : {}),
  };
  const landAreaSqm = capacityResultSeed?.landAreaSqm;
  const baseFloorAreaRatio = capacityResultSeed?.baseFloorAreaRatio;
  const targetTransferRatio = capacityResultSeed?.transferRatio;
  const roadWidthMeters = parseNumericInput(scoringInputs.roadWidthMeters)
    ?? parseNumericInput(capacityInputs?.tdrRoadWidthStatus)
    ?? parseNumericInput(baseInfo?.roadAccess);
  const roadPrecheck = calculateTdrRoadPrecheck(roadWidthMeters, targetTransferRatio);
  const adjacentRoadScore = scoringInputs.adjacentRoadCondition
    ? mapOptionScore(scoringInputs.adjacentRoadCondition, { "8to15": 1, "15plus": 2 })
    : (Number.isFinite(roadWidthMeters) && roadWidthMeters >= 15 ? 2 : Number.isFinite(roadWidthMeters) && roadWidthMeters >= 8 ? 1 : 0);
  const siteCompletenessSubtotal = (scoringInputs.interiorAnglesQualified ? 1 : 0) + adjacentRoadScore;
  const surroundingSubtotal =
    mapOptionScore(scoringInputs.boundarySetback, { "3to5": 2, "5plus": 3 })
    + mapOptionScore(scoringInputs.publicFacilityArea, { "0.2to0.5": 1, "0.5plus": 2, "0.5single": 3 })
    + mapOptionScore(scoringInputs.todDistance, { under300: 2, "300to500": 1 });
  const sendingSiteSubtotal = scoringInputs.fullCashPayment
    ? 10
    : mapOptionScore(scoringInputs.connectedLandRatio, { "60to80": 1, "80to100": 2, "100": 3 })
      + mapOptionScore(scoringInputs.publicFacilityRatio, { "60to80": 1, "80to100": 2, "100": 3 })
      + mapOptionScore(scoringInputs.priorityPublicFacilityRatio, { "40to60": 1, "60to80": 2, "80plus": 3 })
      + clampScore(scoringInputs.announcedAcquisitionScore, 0, 3, 0)
      + (scoringInputs.fullOwnershipOpenedRoad ? 1 : 0);
  const openSpaceSubtotal =
    mapOptionScore(scoringInputs.plazaOpenSpaceRatio, { "10to20": 2, "20to30": 4, "30to40": 6, "40plus": 8 })
    + mapOptionScore(scoringInputs.sidewalkOpenSpaceCondition, { "1.5one": 1, "1.5two": 2, "1.5three": 3, "4one": 2, "4two": 4, "4three": 6 });
  const welfareSubtotal =
    (scoringInputs.donateSocialHousing ? 2 : 0)
    + (scoringInputs.donateChildcare ? 2 : 0)
    + (scoringInputs.donateElderlyCare ? 2 : 0);
  const internalSubtotal = siteCompletenessSubtotal + surroundingSubtotal + sendingSiteSubtotal + openSpaceSubtotal + welfareSubtotal;
  const publicFacilityImprovementSubtotal = mapOptionScore(scoringInputs.publicFacilityImprovementLocation, { around: 4, within500: 2 });
  const environmentImprovementScore = clampScore(scoringInputs.environmentImprovementScore, 0, 8, 0);
  const baseFarMultiplier = Number.isFinite(baseFloorAreaRatio) ? baseFloorAreaRatio / 100 : null;
  const environmentImprovementPrice = Number.isFinite(landAreaSqm) && Number.isFinite(baseFarMultiplier) && environmentImprovementScore > 0
    ? landAreaSqm * baseFarMultiplier * 1.31 * 20000 * environmentImprovementScore
    : null;
  const addedCapacityOutsideBase = Number.isFinite(capacityResultSeed?.totalCapacityAreaSqm) && Number.isFinite(capacityResultSeed?.baseCapacityAreaSqm)
    ? capacityResultSeed.totalCapacityAreaSqm - capacityResultSeed.baseCapacityAreaSqm
    : null;
  const greenTransportNeedsDouble = Boolean(scoringInputs.greenTransportAddedCapacityOver6000)
    || (Number.isFinite(addedCapacityOutsideBase) && addedCapacityOutsideBase >= 6000);
  const greenTransportSubtotal = scoringInputs.greenTransportProvided ? 1 : 0;
  const greenTransportEstimatedCost = scoringInputs.greenTransportProvided
    ? (greenTransportNeedsDouble ? 4000000 : 2000000)
    : null;
  const externalRawSubtotal = publicFacilityImprovementSubtotal + environmentImprovementScore + greenTransportSubtotal;
  const externalAdoptableLimit = internalSubtotal / 3;
  const externalAdoptedScore = Math.min(externalRawSubtotal, externalAdoptableLimit);
  const preliminaryTotalScore = (roadPrecheck.score ?? 0) + internalSubtotal + externalAdoptedScore;
  const hasAnyDetailedScore = internalSubtotal > 0 || externalRawSubtotal > 0;
  const hasCriticalMissing = roadPrecheck.missing || !Number.isFinite(targetTransferRatio) || !hasAnyDetailedScore;
  const scoringStatus = hasCriticalMissing
    ? "資料不足，僅供前期檢核"
    : preliminaryTotalScore >= targetTransferRatio
      ? "初步達標，仍須建築師簽證及主管機關審查確認"
      : "評點初算不足，需補充基地條件、外部改善或重新檢討目標容移比例";

  return roundRecordNumbers({
    roadWidthMeters,
    roadPrecheckScore: roadPrecheck.score,
    roadPrecheckPercentage: roadPrecheck.percentage,
    roadPrecheckStatus: roadPrecheck.status,
    roadTargetNotice: roadPrecheck.targetNotice,
    siteAreaBand: classifyTdrSiteArea(landAreaSqm),
    minimumSideLengthBand: scoringInputs.minimumSideLengthBand,
    siteCompletenessSubtotal,
    surroundingSubtotal,
    sendingSiteSubtotal,
    openSpaceSubtotal,
    welfareSubtotal,
    internalSubtotal,
    publicFacilityImprovementSubtotal,
    environmentImprovementScore,
    environmentImprovementPrice,
    greenTransportSubtotal,
    greenTransportNeedsDouble,
    greenTransportEstimatedCost,
    addedCapacityOutsideBase,
    targetTransferAreaSqm: capacityResultSeed?.transferAreaSqm ?? null,
    externalRawSubtotal,
    externalAdoptableLimit,
    externalAdoptedScore,
    preliminaryTotalScore,
    targetTransferRatio,
    scoringStatus,
  });
}

function getEffectiveFloorEfficiencyParams(floorParams, capacityResult) {
  return {
    ...defaultFloorEfficiencyParams,
    ...floorParams,
    landUseBonusRate: Number.isFinite(capacityResult?.otherBonusRatio)
      ? formatPercentValue(capacityResult.otherBonusRatio)
      : floorParams?.landUseBonusRate || defaultFloorEfficiencyParams.landUseBonusRate,
    tdrRate: Number.isFinite(capacityResult?.transferRatio)
      ? formatPercentValue(capacityResult.transferRatio)
      : floorParams?.tdrRate || defaultFloorEfficiencyParams.tdrRate,
    urbanRenewalBonusRate: Number.isFinite(capacityResult?.urbanRenewalBonusRatio)
      ? formatPercentValue(capacityResult.urbanRenewalBonusRatio)
      : floorParams?.urbanRenewalBonusRate || defaultFloorEfficiencyParams.urbanRenewalBonusRate,
    dangerousOldBuildingBonusRate: Number.isFinite(capacityResult?.unsafeBuildingBonusRatio)
      ? formatPercentValue(capacityResult.unsafeBuildingBonusRatio)
      : floorParams?.dangerousOldBuildingBonusRate || defaultFloorEfficiencyParams.dangerousOldBuildingBonusRate,
  };
}

function calculateCapacityResult(rosterStaging, baseInfo, capacityInputs) {
  const rosterSummary = buildRosterBaseSummary(rosterStaging);
  const assessedCurrentValueSummary = buildAssessedCurrentValueSummary(rosterStaging);
  const landAreaSqm = rosterSummary.landAreaSqm;
  const baseFloorAreaRatio = parseNumericInput(capacityInputs.baseFloorAreaRatio);
  const transferRatio = parseNumericInput(capacityInputs.transferRatio) ?? 0;
  const urbanRenewalCentralBonusRatio = parseNumericInput(capacityInputs.urbanRenewalCentralBonusRatio);
  const urbanRenewalLocalBonusRatio = parseNumericInput(capacityInputs.urbanRenewalLocalBonusRatio);
  const urbanRenewalBonusRatio = Number.isFinite(urbanRenewalCentralBonusRatio) || Number.isFinite(urbanRenewalLocalBonusRatio)
    ? (urbanRenewalCentralBonusRatio ?? 0) + (urbanRenewalLocalBonusRatio ?? 0)
    : parseNumericInput(capacityInputs.urbanRenewalBonusRatio) ?? 0;
  const unsafeBuildingBonusRatio = parseNumericInput(capacityInputs.unsafeBuildingBonusRatio) ?? 0;
  const otherBonusRatio = parseNumericInput(capacityInputs.otherBonusRatio) ?? 0;
  const incrementalCapacityRatio = parseNumericInput(capacityInputs.incrementalCapacityRatio) ?? 0;
  const donorAssessedCurrentValue = parseNumericInput(capacityInputs.tdrDonorAssessedCurrentValue);
  const recipientAssessedCurrentValue = parseNumericInput(capacityInputs.tdrRecipientAssessedCurrentValue)
    ?? assessedCurrentValueSummary.assessedCurrentValueWeightedUnit;
  const recipientFloorAreaRatio = parseNumericInput(capacityInputs.tdrRecipientFloorAreaRatio)
    ?? baseFloorAreaRatio;
  const marketUnitPricePerPing = parseNumericInput(capacityInputs.tdrMarketUnitPricePerPing);
  const marketPriceMultiplier = parseNumericInput(capacityInputs.tdrMarketPriceMultiplier);
  const missingItems = [];

  if (!Number.isFinite(landAreaSqm)) {
    missingItems.push("土地清冊或土地面積");
  }
  if (!Number.isFinite(baseFloorAreaRatio)) {
    missingItems.push("基準容積率");
  }

  const canCalculate = !missingItems.length;
  const baseCapacityAreaSqm = canCalculate ? landAreaSqm * baseFloorAreaRatio / 100 : null;
  const transferAreaSqm = Number.isFinite(baseCapacityAreaSqm) ? baseCapacityAreaSqm * transferRatio / 100 : null;
  const urbanRenewalBonusAreaSqm = Number.isFinite(baseCapacityAreaSqm) ? baseCapacityAreaSqm * urbanRenewalBonusRatio / 100 : null;
  const unsafeBuildingBonusAreaSqm = Number.isFinite(baseCapacityAreaSqm) ? baseCapacityAreaSqm * unsafeBuildingBonusRatio / 100 : null;
  const otherBonusAreaSqm = Number.isFinite(baseCapacityAreaSqm) ? baseCapacityAreaSqm * otherBonusRatio / 100 : null;
  const incrementalCapacityAreaSqm = Number.isFinite(baseCapacityAreaSqm) ? baseCapacityAreaSqm * incrementalCapacityRatio / 100 : null;
  const totalCapacityAreaSqm = canCalculate
    ? baseCapacityAreaSqm
      + transferAreaSqm
      + urbanRenewalBonusAreaSqm
      + unsafeBuildingBonusAreaSqm
      + incrementalCapacityAreaSqm
      + otherBonusAreaSqm
    : null;
  const totalFloorAreaRatio = Number.isFinite(totalCapacityAreaSqm) && Number.isFinite(landAreaSqm) && landAreaSqm !== 0
    ? totalCapacityAreaSqm / landAreaSqm * 100
    : null;
  const tdrDonationFactor = Number.isFinite(donorAssessedCurrentValue)
    && Number.isFinite(recipientAssessedCurrentValue)
    && recipientAssessedCurrentValue > 0
    && Number.isFinite(recipientFloorAreaRatio)
    ? donorAssessedCurrentValue / recipientAssessedCurrentValue * recipientFloorAreaRatio / 100
    : null;
  const tdrRequiredDonorLandAreaSqm = Number.isFinite(transferAreaSqm) && Number.isFinite(tdrDonationFactor) && tdrDonationFactor > 0
    ? transferAreaSqm / tdrDonationFactor
    : null;
  const tdrRequiredDonorLandAreaPing = convertSqmToPing(tdrRequiredDonorLandAreaSqm);
  const tdrDonorAssessedCurrentValueTotal = Number.isFinite(tdrRequiredDonorLandAreaSqm) && Number.isFinite(donorAssessedCurrentValue)
    ? tdrRequiredDonorLandAreaSqm * donorAssessedCurrentValue
    : null;
  const tdrMarketPriceCost = Number.isFinite(tdrRequiredDonorLandAreaPing) && Number.isFinite(marketUnitPricePerPing)
    ? tdrRequiredDonorLandAreaPing * marketUnitPricePerPing
    : null;
  const tdrAssessedValueMultiplierCost = Number.isFinite(tdrDonorAssessedCurrentValueTotal) && Number.isFinite(marketPriceMultiplier)
    ? tdrDonorAssessedCurrentValueTotal * marketPriceMultiplier
    : null;
  const capacityResultSeed = {
    landAreaSqm,
    baseFloorAreaRatio,
    transferRatio,
    baseCapacityAreaSqm,
    transferAreaSqm,
    totalCapacityAreaSqm,
  };
  const tdrScoringSummary = calculateTdrScoringSummary(baseInfo, capacityInputs, capacityResultSeed);

  return roundRecordNumbers({
    landAreaSqm,
    landAreaPing: convertSqmToPing(landAreaSqm),
    landNumberCount: rosterSummary.landNumberCount,
    assessedCurrentValueTotal: assessedCurrentValueSummary.assessedCurrentValueTotal,
    assessedCurrentValueWeightedUnit: assessedCurrentValueSummary.assessedCurrentValueWeightedUnit,
    assessedCurrentValueByLot: assessedCurrentValueSummary.assessedCurrentValueByLot,
    assessedCurrentValueSourceStatus: assessedCurrentValueSummary.assessedCurrentValueSourceStatus,
    baseFloorAreaRatio,
    transferRatio,
    urbanRenewalCentralBonusRatio,
    urbanRenewalLocalBonusRatio,
    urbanRenewalBonusRatio,
    unsafeBuildingBonusRatio,
    otherBonusRatio,
    incrementalCapacityRatio,
    baseCapacityAreaSqm,
    transferAreaSqm,
    tdrCapacityAreaSqm: transferAreaSqm,
    tdrRate: transferRatio,
    urbanRenewalBonusAreaSqm,
    unsafeBuildingBonusAreaSqm,
    incrementalCapacityAreaSqm,
    otherBonusAreaSqm,
    totalFloorAreaRatio,
    totalCapacityAreaSqm,
    totalCapacityAreaPing: convertSqmToPing(totalCapacityAreaSqm),
    calculationStatus: canCalculate ? "可進行前端測試初算" : `尚缺：${missingItems.join("、")}`,
    missingItems,
    formulaStatus: "測試用簡化公式；正式公式待確認",
    tdrCostFormulaStatus: "容積移轉費用正式計算方式待確認",
    tdrScoringSummary,
    // Future TDR cost calculations must use these raw numeric fields, not formatted display strings.
    tdrCostBasisFields: [
      "assessedCurrentValueTotal",
      "assessedCurrentValueWeightedUnit",
      "assessedCurrentValueByLot",
      "tdrCapacityAreaSqm",
      "tdrRate",
      "tdrRequiredDonorLandAreaSqm",
      "officialTdrCostFormula",
    ],
    tdrCostBasis: {
      targetTransferAreaSqm: transferAreaSqm,
      donorAssessedCurrentValue,
      recipientAssessedCurrentValue,
      recipientFloorAreaRatio,
      tdrDonationFactor,
      requiredDonorLandAreaSqm: tdrRequiredDonorLandAreaSqm,
      requiredDonorLandAreaPing: tdrRequiredDonorLandAreaPing,
      donorAssessedCurrentValueTotal: tdrDonorAssessedCurrentValueTotal,
      marketUnitPricePerPing,
      marketPriceCost: tdrMarketPriceCost,
      marketPriceMultiplier,
      assessedValueMultiplierCost: tdrAssessedValueMultiplierCost,
    },
    source: {
      zoning: baseInfo?.zoning || "",
      buildingCoverageRatio: baseInfo?.buildingCoverageRatio || "",
      roadAccess: baseInfo?.roadAccess || "",
      siteRestrictions: baseInfo?.siteRestrictions || "",
      legalRestrictions: baseInfo?.legalRestrictions || "",
    },
  }, INTERNAL_DECIMAL_DIGITS);
}

function calculateFloorEfficiencyResult(rosterStaging, baseInfo, capacityResult, floorParams) {
  const rosterSummary = buildRosterBaseSummary(rosterStaging);
  const assessedCurrentValueSummary = buildAssessedCurrentValueSummary(rosterStaging);
  const landAreaSqm = pickNumericValue(capacityResult?.landAreaSqm, rosterSummary.landAreaSqm);
  const landAreaPing = convertSqmToPing(landAreaSqm);
  const coverageRate = parseRateInput(baseInfo?.buildingCoverageRatio);
  const hasCapacityModuleResult = Number.isFinite(capacityResult?.totalCapacityAreaSqm);
  const baseFarRate = Number.isFinite(capacityResult?.baseFloorAreaRatio)
    ? capacityResult.baseFloorAreaRatio
    : parseRateInput(baseInfo?.baseFloorAreaRatio);
  const simpleUrbanRenewalBonusRate = hasCapacityModuleResult ? 0 : parseRateInput(floorParams.simpleUrbanRenewalBonusRate, 0);
  const landUseBonusRate = parseRateInput(floorParams.landUseBonusRate, capacityResult?.otherBonusRatio ?? 0);
  const tdrRate = parseRateInput(floorParams.tdrRate, capacityResult?.transferRatio ?? 0);
  const urbanRenewalBonusRate = parseRateInput(floorParams.urbanRenewalBonusRate, capacityResult?.urbanRenewalBonusRatio ?? 0);
  const dangerousOldBuildingBonusRate = parseRateInput(floorParams.dangerousOldBuildingBonusRate, capacityResult?.unsafeBuildingBonusRatio ?? 0);
  const equipmentExemptionRate = parseRateInput(floorParams.equipmentExemptionRate);
  const lobbyRate = parseRateInput(floorParams.lobbyRate);
  const balconyRate = parseRateInput(floorParams.balconyRate);
  const roofProjectionRate = parseRateInput(floorParams.roofProjectionRate);
  const rainShelterRate = parseRateInput(floorParams.rainShelterRate, 0);
  const buildingEnvelopeRate = parseRateInput(floorParams.buildingEnvelopeRate, 0);
  const publicServiceRate = parseRateInput(floorParams.publicServiceRate, 0);
  const basementMultiplier = parsePlainNumberInput(floorParams.basementMultiplier);
  const undergroundFloors = parsePlainNumberInput(floorParams.undergroundFloors);
  const parkingUnitAreaPing = parsePlainNumberInput(floorParams.parkingUnitAreaPing);
  const selfParkingCount = parsePlainNumberInput(floorParams.selfParkingCount, 0);
  const motorcycleParkingCount = parsePlainNumberInput(floorParams.motorcycleParkingCount, 0);
  const bikeParkingCount = parsePlainNumberInput(floorParams.bikeParkingCount, 0);
  const saleableAdjustmentRatio = parseRateInput(floorParams.saleableAdjustmentRatio);
  const targetPublicAreaRatio = parseRateInput(floorParams.publicAreaRatio);
  const assessedCurrentValueTotal = pickNumericValue(
    capacityResult?.assessedCurrentValueTotal,
    assessedCurrentValueSummary.assessedCurrentValueTotal,
  );
  const assessedCurrentValueWeightedUnit = pickNumericValue(
    capacityResult?.assessedCurrentValueWeightedUnit,
    assessedCurrentValueSummary.assessedCurrentValueWeightedUnit,
  );
  const assessedCurrentValueByLot = Array.isArray(capacityResult?.assessedCurrentValueByLot)
    ? capacityResult.assessedCurrentValueByLot
    : assessedCurrentValueSummary.assessedCurrentValueByLot;
  const assessedCurrentValueSourceStatus = capacityResult?.assessedCurrentValueSourceStatus
    || assessedCurrentValueSummary.assessedCurrentValueSourceStatus;
  const missingItems = [];

  if (!Number.isFinite(landAreaSqm)) {
    missingItems.push("土地面積");
  }
  if (!Number.isFinite(baseFarRate)) {
    missingItems.push("基準容積率");
  }
  if (!Number.isFinite(capacityResult?.totalCapacityAreaSqm)) {
    missingItems.push("容積來源試算結果");
  }
  if (!Number.isFinite(coverageRate)) {
    missingItems.push("建蔽率");
  }
  if (!Number.isFinite(equipmentExemptionRate)) {
    missingItems.push("設備空間免計比例");
  }
  if (!Number.isFinite(lobbyRate)) {
    missingItems.push("梯廳比例");
  }
  if (!Number.isFinite(balconyRate)) {
    missingItems.push("陽台比例");
  }
  if (!Number.isFinite(roofProjectionRate)) {
    missingItems.push("屋突比例");
  }
  if (!Number.isFinite(basementMultiplier)) {
    missingItems.push("地下層面積倍數");
  }
  if (!Number.isFinite(undergroundFloors)) {
    missingItems.push("地下層數");
  }
  if (!Number.isFinite(parkingUnitAreaPing)) {
    missingItems.push("車位單位面積");
  }
  if (!Number.isFinite(saleableAdjustmentRatio)) {
    missingItems.push("銷售面積校正比例");
  }

  const canCalculate = !missingItems.length;
  const legalCoverageAreaSqm = canCalculate ? landAreaSqm * coverageRate / 100 : null;
  const baseCapacityAreaSqm = canCalculate
    ? pickNumericValue(capacityResult?.baseCapacityAreaSqm, landAreaSqm * baseFarRate / 100)
    : null;
  const simpleUrbanRenewalBonusAreaSqm = canCalculate ? baseCapacityAreaSqm * simpleUrbanRenewalBonusRate / 100 : null;
  const landUseBonusAreaSqm = canCalculate
    ? pickNumericValue(capacityResult?.otherBonusAreaSqm, baseCapacityAreaSqm * landUseBonusRate / 100)
    : null;
  const tdrCapacityAreaSqm = canCalculate
    ? pickNumericValue(capacityResult?.tdrCapacityAreaSqm, capacityResult?.transferAreaSqm, baseCapacityAreaSqm * tdrRate / 100)
    : null;
  const urbanRenewalBonusAreaSqm = canCalculate
    ? pickNumericValue(capacityResult?.urbanRenewalBonusAreaSqm, baseCapacityAreaSqm * urbanRenewalBonusRate / 100)
    : null;
  const dangerousOldBuildingBonusAreaSqm = canCalculate
    ? pickNumericValue(capacityResult?.unsafeBuildingBonusAreaSqm, baseCapacityAreaSqm * dangerousOldBuildingBonusRate / 100)
    : null;
  const rewardCapacityAreaSqm = canCalculate
    ? simpleUrbanRenewalBonusAreaSqm
      + landUseBonusAreaSqm
      + tdrCapacityAreaSqm
      + urbanRenewalBonusAreaSqm
      + dangerousOldBuildingBonusAreaSqm
    : null;
  const totalRewardCapacityAreaSqm = canCalculate
    ? pickNumericValue(
      Number.isFinite(capacityResult?.totalCapacityAreaSqm) && Number.isFinite(baseCapacityAreaSqm)
        ? capacityResult.totalCapacityAreaSqm - baseCapacityAreaSqm
        : null,
      rewardCapacityAreaSqm,
    )
    : null;
  const allowedCapacityAreaSqm = canCalculate
    ? pickNumericValue(capacityResult?.totalCapacityAreaSqm, baseCapacityAreaSqm + totalRewardCapacityAreaSqm)
    : null;
  const equipmentExemptionAreaSqm = canCalculate ? allowedCapacityAreaSqm * equipmentExemptionRate / 100 : null;
  const lobbyAreaSqm = canCalculate ? (allowedCapacityAreaSqm + equipmentExemptionAreaSqm) / 0.95 * lobbyRate / 100 : null;
  const balconyAreaSqm = canCalculate ? (allowedCapacityAreaSqm + equipmentExemptionAreaSqm + lobbyAreaSqm) * balconyRate / 100 : null;
  const excludedCapacityAreaSqm = canCalculate ? equipmentExemptionAreaSqm + lobbyAreaSqm + balconyAreaSqm : null;
  const roofProjectionAreaSqm = canCalculate ? legalCoverageAreaSqm * roofProjectionRate / 100 * 3 : null;
  const rainShelterAreaSqm = canCalculate ? allowedCapacityAreaSqm * rainShelterRate / 100 : null;
  const buildingEnvelopeAreaSqm = canCalculate ? allowedCapacityAreaSqm * buildingEnvelopeRate / 100 : null;
  const publicServiceAreaSqm = canCalculate ? baseCapacityAreaSqm * publicServiceRate / 100 : null;
  const roofAndProjectionAreaSqm = canCalculate
    ? roofProjectionAreaSqm + rainShelterAreaSqm + buildingEnvelopeAreaSqm + publicServiceAreaSqm
    : null;
  const aboveGroundBuildAreaSqm = canCalculate ? allowedCapacityAreaSqm + excludedCapacityAreaSqm + roofAndProjectionAreaSqm : null;
  const aboveGroundFloorAreaSqm = canCalculate ? aboveGroundBuildAreaSqm - balconyAreaSqm - roofProjectionAreaSqm : null;
  const aboveGroundFloors = canCalculate && legalCoverageAreaSqm > 0
    ? Math.ceil(aboveGroundFloorAreaSqm / legalCoverageAreaSqm)
    : null;
  const basementFloorAreaSqm = canCalculate ? landAreaSqm * basementMultiplier * undergroundFloors : null;
  const legalParkingCount = canCalculate ? Math.max((aboveGroundFloorAreaSqm - 500) / 150, 0) : null;
  const totalParkingCount = canCalculate ? legalParkingCount + selfParkingCount + motorcycleParkingCount + bikeParkingCount : null;
  const parkingAreaPing = canCalculate ? totalParkingCount * parkingUnitAreaPing : null;
  const parkingAreaSqm = canCalculate ? pingToSqm(parkingAreaPing) : null;
  const sharedPublicAreaSqm = canCalculate ? Math.max(basementFloorAreaSqm - parkingAreaSqm, 0) : null;
  const totalFloorAreaSqm = canCalculate ? aboveGroundBuildAreaSqm + basementFloorAreaSqm : null;
  const totalFloorAreaPing = convertSqmToPing(totalFloorAreaSqm);
  const saleableAreaBeforeAdjustmentSqm = canCalculate
    ? allowedCapacityAreaSqm + excludedCapacityAreaSqm + roofAndProjectionAreaSqm + sharedPublicAreaSqm
    : null;
  const saleableAreaSqm = canCalculate ? saleableAreaBeforeAdjustmentSqm * saleableAdjustmentRatio / 100 : null;
  const saleableAreaPing = convertSqmToPing(saleableAreaSqm);
  const publicAreaSqm = canCalculate ? equipmentExemptionAreaSqm + lobbyAreaSqm + roofProjectionAreaSqm + sharedPublicAreaSqm : null;
  const publicAreaPing = convertSqmToPing(publicAreaSqm);
  const calculatedPublicAreaRatio = canCalculate && saleableAreaSqm > 0 ? publicAreaSqm / saleableAreaSqm * 100 : null;
  const totalFloorAreaPingValue = convertSqmToPing(totalFloorAreaSqm);
  const buildPingPerLandPing = canCalculate && landAreaPing ? totalFloorAreaPingValue / landAreaPing : null;
  const saleablePingPerLandPing = canCalculate && landAreaPing ? saleableAreaPing / landAreaPing : null;

  return roundRecordNumbers({
    landAreaSqm,
    landAreaPing,
    landNumberCount: rosterSummary.landNumberCount,
    landNumberDisplay: rosterSummary.landNumberDisplay,
    assessedCurrentValueTotal,
    assessedCurrentValueWeightedUnit,
    assessedCurrentValueByLot,
    assessedCurrentValueSourceStatus,
    currentValueTotal: assessedCurrentValueTotal,
    currentValuePerSqm: assessedCurrentValueWeightedUnit,
    coverageRate,
    baseFarRate,
    baseFloorAreaRatio: baseFarRate,
    simpleUrbanRenewalBonusRate,
    landUseBonusRate,
    tdrRate,
    urbanRenewalBonusRate,
    dangerousOldBuildingBonusRate,
    totalFloorAreaRatio: Number.isFinite(capacityResult?.totalFloorAreaRatio)
      ? capacityResult.totalFloorAreaRatio
      : Number.isFinite(baseFarRate)
        ? baseFarRate + simpleUrbanRenewalBonusRate + landUseBonusRate + tdrRate + urbanRenewalBonusRate + dangerousOldBuildingBonusRate
        : null,
    legalCoverageAreaSqm,
    baseCapacityAreaSqm,
    simpleUrbanRenewalBonusAreaSqm,
    landUseBonusAreaSqm,
    tdrCapacityAreaSqm,
    urbanRenewalBonusAreaSqm,
    dangerousOldBuildingBonusAreaSqm,
    rewardCapacityAreaSqm,
    totalRewardCapacityAreaSqm,
    allowedCapacityAreaSqm,
    capacityModuleTotalAreaSqm: capacityResult?.totalCapacityAreaSqm ?? null,
    equipmentExemptionAreaSqm,
    lobbyAreaSqm,
    balconyAreaSqm,
    excludedCapacityAreaSqm,
    roofProjectionAreaSqm,
    rainShelterAreaSqm,
    buildingEnvelopeAreaSqm,
    publicServiceAreaSqm,
    roofAndProjectionAreaSqm,
    aboveGroundBuildAreaSqm,
    aboveGroundFloors,
    undergroundFloors,
    aboveGroundFloorAreaSqm,
    basementFloorAreaSqm,
    legalParkingCount,
    selfParkingCount,
    motorcycleParkingCount,
    bikeParkingCount,
    totalParkingCount,
    parkingUnitAreaPing,
    parkingAreaSqm,
    sharedPublicAreaSqm,
    totalFloorAreaSqm,
    totalFloorAreaPing,
    saleableAdjustmentRatio,
    saleableAreaBeforeAdjustmentSqm,
    saleableAreaSqm,
    saleableAreaPing,
    publicAreaSqm,
    publicAreaPing,
    targetPublicAreaRatio,
    calculatedPublicAreaRatio,
    buildPingPerLandPing,
    saleablePingPerLandPing,
    calculationStatus: canCalculate ? "可依坪效計算表模型進行前端測試初算" : `尚缺：${missingItems.join("、")}`,
    missingItems,
    formulaStatus: "測試用公式；正式公式待確認",
    formulaSource: "坪效計算表(1).xlsx",
  }, INTERNAL_DECIMAL_DIGITS);
}

function RosterUploadTesting({ currentCase, fileInputRef, onRequestFile, preview, onPreviewChange }) {
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputId = `roster-upload-file-${currentCase.id}`;
  const displayFileName = fileName || preview?.fileName || "";

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    setParseError("");

    if (!file) {
      setParseError("尚未選擇清冊檔案。");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setParseError("目前清冊上傳測試只接受 .xlsx 檔案。");
      event.target.value = "";
      return;
    }

    onPreviewChange(null);
    setIsParsing(true);
    try {
      const workbookData = await parseRosterWorkbook(file);
      if (!workbookData.availableSheets.includes(rosterImportSheets.land)) {
        setParseError("找不到「土地清冊_匯入」工作表，請確認檔案是否為第七版清冊模板。");
        return;
      }

      const rosterPreview = buildRosterPreview(file, workbookData);
      onPreviewChange(rosterPreview);
      if (!rosterPreview.landRights.length) {
        setParseError("解析結果為 0 筆有效土地權利列，請確認「土地清冊_匯入」是否已填寫地號、地主姓名、持分或參考編號。");
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "清冊解析失敗，請確認檔案是否為標準 .xlsx。");
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const summaryCards = preview ? [
    ["匯入批次", preview.batchId],
    ["檔案名稱", preview.fileName],
    ["匯入時間", preview.importedAt],
    ["土地清冊筆數", preview.summary.landCount],
    ["建物清冊筆數", preview.summary.buildingCount],
    ["疑似權利人群組數", preview.summary.partyCount],
    ["涉及地號數", preview.summary.landNumberCount],
    ["涉及建號數", preview.summary.buildingNumberCount],
    ["疑似同姓多地號群組", preview.summary.sameNameMultiLandCount],
    ["疑似同姓多建號群組", preview.summary.sameNameMultiBuildingCount],
    ["待人工確認筆數", preview.summary.manualReviewCount],
    ["檢核警示數", preview.summary.warningCount],
  ] : [];

  return (
    <section className="eval-roster-upload-test">
      <section className="eval-module-section eval-roster-upload-card">
        <div className="eval-section-head">
          <h4>清冊上傳測試</h4>
          <p>先以上傳檔建立目前案件的暫存批次，不直接覆蓋正式資料，也不寫入資料庫。地主編號只作為原始參考欄位，不作為唯一必填主鍵。</p>
          <p>若資料來自第二類謄本，系統以地號、建號與原始權利列為基準，只做暫時比對與疑似權利人群組，不因同姓或部分證號相同而自動合併。正式歸戶需等後續補上完整姓名、完整證號、統編，或經人工確認後才成立。</p>
        </div>
        <div className="eval-roster-upload-controls">
          <div className="eval-roster-file-picker">
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="eval-roster-file-input"
            />
            <label htmlFor={fileInputId}>清冊檔案上傳 .xlsx</label>
            <button type="button" onClick={onRequestFile}>
              選擇 .xlsx 檔案
            </button>
            <small>選檔後先建立暫存預覽，不會覆蓋正式案件清冊。</small>
          </div>
          <article>
            <strong>{displayFileName || "尚未選擇檔案"}</strong>
            <p>匯入結果將暫時歸屬於目前案件：{currentCase.code} / {currentCase.name}</p>
          </article>
        </div>
        <div className="eval-roster-next-sheets">
          <span>{rosterImportSheets.land}</span>
          <span>{rosterImportSheets.building}</span>
          <span>{rosterImportSheets.integration}：下一階段串接</span>
          <span>{rosterImportSheets.allocation}：下一階段串接</span>
        </div>
        <div className="eval-roster-status-set" aria-label="疑似權利人群組狀態">
          <strong>歸戶狀態設計</strong>
          {["未歸戶", "疑似同姓", "部分識別碼相符", "高度疑似同一人", "待人工確認", "已人工確認", "已完整資料確認"].map((status) => (
            <span key={status}>{status}</span>
          ))}
        </div>
        {isParsing && <p className="eval-roster-status">正在讀取清冊並建立疑似權利人群組...</p>}
        {parseError && <p className="eval-auth-error">{parseError}</p>}
      </section>

      {!preview && !isParsing && (
        <section className="eval-module-section eval-roster-empty-state">
          <div className="eval-section-head">
            <h4>尚未上傳清冊檔案</h4>
            <p>目前尚未上傳清冊檔案，請選擇 .xlsx 清冊進行暫存預覽。未上傳前不顯示土地、建物、疑似群組或待確認的範例資料。</p>
          </div>
        </section>
      )}

      {preview && (
        <>
          <section className="eval-module-section">
            <div className="eval-section-head">
              <h4>匯入摘要</h4>
              <p>本區資料來源：本次上傳檔案暫存解析結果，尚未正式套用至案件清冊。</p>
            </div>
            <div className="eval-roster-summary-grid eval-roster-summary-grid--wide">
              {summaryCards.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </section>

          <RosterPreviewTable
            title="土地權利明細預覽"
            description="顯示本次上傳檔案解析出的每一筆土地權利列；每列都保留為原始資料，不因姓名或參考編號自動合併。"
            emptyText="目前未讀到土地清冊資料。"
            columns={[
              { key: "landRightRowId", label: "土地列 ID" },
              { key: "sourceRowNumber", label: "原始列號" },
              { key: "ownerReferenceId", label: "地主編號" },
              { key: "ownerName", label: "地主姓名" },
              { key: "maskedIdentityCode", label: "遮蔽證號 / 前碼" },
              { key: "landNumber", label: "地號" },
              { key: "shareText", label: "權利範圍 / 持分" },
              { key: "validationStatus", label: "檢核狀態" },
            ]}
            rows={preview.landRights}
          />

          <RosterPreviewTable
            title="建物權利明細預覽"
            description="顯示本次上傳檔案解析出的每一筆建物權利列；若建物清冊沒有有效資料，僅顯示空狀態。"
            emptyText="目前未讀到建物清冊資料。"
            columns={[
              { key: "buildingRightRowId", label: "建物列 ID" },
              { key: "sourceRowNumber", label: "原始列號" },
              { key: "ownerReferenceId", label: "地主編號" },
              { key: "ownerName", label: "地主姓名" },
              { key: "maskedIdentityCode", label: "遮蔽證號 / 前碼" },
              { key: "relatedLandNumber", label: "對應地號" },
              { key: "buildingNumber", label: "建號" },
              { key: "validationStatus", label: "檢核狀態" },
            ]}
            rows={preview.buildingRights}
          />

          <RosterPreviewTable
            title="疑似權利人群組總表"
            description="PG-* 只是疑似權利人群組，不是正式權利人歸戶；正式歸戶需補登完整資料或人工確認。"
            emptyText="目前尚未建立疑似權利人群組。"
            columns={[
              { key: "partyGroupId", label: "群組 ID" },
              { key: "name", label: "原始姓名 / 名稱" },
              { key: "ownerReferenceIds", label: "原始參考編號" },
              { key: "maskedIdentityCodes", label: "遮蔽證號 / 前碼" },
              { key: "landNumbers", label: "涉及地號" },
              { key: "buildingNumbers", label: "涉及建號" },
              { key: "confidence", label: "歸戶狀態" },
              { key: "reasons", label: "待確認原因" },
            ]}
            rows={preview.partyRows}
          />

          <section className="eval-module-section">
            <div className="eval-section-head">
              <h4>待人工確認清單</h4>
              <p>以下項目不阻擋匯入暫存，但正式套用前必須人工確認。</p>
            </div>
            {preview.issues.length ? (
              <div className="eval-roster-issue-list eval-roster-issue-scroll">
                {preview.issues.map((issue) => (
                  <article key={issue.id}>
                    <span data-severity={issue.severity}>{issue.severity}</span>
                    <strong>{issue.type}</strong>
                    <p>{issue.message}</p>
                    <small>{issue.rows.length ? `關聯列：${issue.rows.join("、")}` : "請回原始清冊確認"}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="eval-roster-empty">目前沒有待人工確認項目。</p>
            )}
          </section>

          <section className="eval-module-section">
            <div className="eval-section-head">
              <h4>下一步提示</h4>
              <p>正式流程會是：上傳 Excel → 暫存批次 → 欄位檢核 → 疑似權利人群組 → 人工確認合併 / 拆分 → 補登完整資料 → 二次確認 → 套用到正式案件清冊，並可升級為正式權利人總表。</p>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

function RosterImportVersioning({ config }) {
  if (!config) {
    return null;
  }

  return (
    <details className="eval-module-section eval-roster-future-flow" data-roster-versioning>
      <summary>
        <span>後續正式匯入流程（開發中）</span>
        <small>正式匯入流程將包含欄位檢核、跨表關聯檢核、差異比對、二次確認、正式套用、版本回復與 audit log，目前本區僅作流程規劃提示。</small>
      </summary>
      <div className="eval-roster-future-flow__body">
        <p>{config.notice}</p>
        <ol>
          {[
            "上傳 Excel 並建立目前案件的暫存批次",
            "檢查必要工作表、欄位名稱與核心資料格式",
            "比對土地、建物、整合紀錄與分配條件的跨表關聯",
            "產生差異比對與待人工確認清單",
            "完成二次確認後才套用到正式案件清冊",
            "保留版本回復與 audit log，避免正式資料被無痕覆蓋",
          ].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}

function BaseInfoCaseRequiredNotice({ onGoToCases }) {
  return (
    <section className="eval-module-section eval-case-required">
      <LockKeyhole aria-hidden="true" size={30} />
      <div>
        <p className="eval-kicker">CASE REQUIRED</p>
        <h4>請先建立或選擇案件，才能編輯基地基本資料。</h4>
        <p>
          基地基本資料必須歸屬於目前案件，後續容積試算、坪效、成本、分配與銀行報告才有一致的資料來源。
        </p>
        <button type="button" onClick={onGoToCases}>
          前往案件管理
        </button>
      </div>
    </section>
  );
}

function BaseRosterSummary({ rosterStaging }) {
  const rosterSummary = buildRosterBaseSummary(rosterStaging);

  if (!rosterSummary.hasRoster) {
    return (
      <section className="eval-module-section eval-base-roster-summary">
        <div className="eval-section-head">
          <h4>清冊帶入摘要</h4>
          <p>尚未上傳土地清冊，地號、土地面積、公告現值與公告地價將於清冊上傳後帶入。</p>
        </div>
      </section>
    );
  }

  const summaryItems = [
    ["地號筆數", rosterSummary.landNumberCount],
    ["地號清單", rosterSummary.landNumberDisplay],
    ["土地權利列數", rosterSummary.landRightCount],
    ["土地面積合計", rosterSummary.landAreaSummary],
    ["公告現值狀態", rosterSummary.announcedCurrentValueStatus],
    ["公告現值總額", formatCurrencyTwd(rosterSummary.assessedCurrentValueTotal)],
    ["公告現值加權平均單價", formatCurrencyTwdPerSqm(rosterSummary.assessedCurrentValueWeightedUnit)],
    ["公告地價狀態", rosterSummary.announcedLandValueStatus],
    ["來源檔案名稱", rosterSummary.fileName],
    ["匯入時間", rosterSummary.importedAt],
  ];

  return (
    <section className="eval-module-section eval-base-roster-summary">
      <div className="eval-section-head">
        <h4>清冊帶入摘要</h4>
        <p>本區彙整目前案件的清冊暫存解析結果，尚未正式套用至案件清冊。</p>
      </div>
      <div className="eval-base-summary-grid">
        {summaryItems.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value || "待清冊補齊"}</strong>
          </article>
        ))}
      </div>
      <p className="eval-base-summary-note">
        土地面積以唯一地號為基準彙整；同一地號若出現在多筆權利列，只計算一次。畫面數字為四捨五入顯示；系統內部以較高精度試算，坪數換算統一使用 1 坪 = 3.305785 平方公尺。
      </p>
      <p className="eval-base-summary-note">
        公告現值總額依各地號面積與公告現值逐筆加總；單價為加權平均，畫面四捨五入顯示。後續容積移轉費用、成本與分配若引用公告現值，應引用系統內部原始數值，不使用格式化後字串或整數顯示值。
      </p>
    </section>
  );
}

function BaseInfoModule({
  currentCase,
  baseInfo,
  rosterStaging,
  saveStatus,
  onBaseInfoChange,
  onMarkUnsaved,
  onSaveModule,
  onGoToCases,
}) {
  if (!currentCase) {
    return (
      <div className="eval-module-stack">
        <BaseInfoCaseRequiredNotice onGoToCases={onGoToCases} />
      </div>
    );
  }

  const handleBaseInfoChange = (field) => (event) => {
    onMarkUnsaved();
    onBaseInfoChange({
      ...baseInfo,
      [field]: event.target.value,
    });
  };

  return (
    <div className="eval-module-stack">
      <CurrentCaseSummary currentCase={currentCase} />
      <ModuleSaveStatusBar saveStatus={saveStatus} onSave={onSaveModule} />
      <BaseRosterSummary rosterStaging={rosterStaging} />
      <section className="eval-module-section">
        <div className="eval-section-head">
          <h4>基地基本資料</h4>
          <p>本表單只填寫案件層級的基地條件；地號、土地面積、公告現值與公告地價由目前案件的清冊暫存結果帶入。</p>
        </div>
        <div className="eval-base-case-name">
          <span>案件名稱</span>
          <strong>{currentCase.name}</strong>
        </div>
        <div className="eval-field-grid eval-base-info-form">
          {baseInfoFields.map((field) => (
            <label className={`eval-field${field.wide ? " eval-field--wide" : ""}`} key={field.key}>
              <span>{field.label}</span>
              <input
                type="text"
                value={baseInfo[field.key] ?? ""}
                onChange={handleBaseInfoChange(field.key)}
                placeholder={field.placeholder}
              />
              {field.key === "roadAccess" && <small>包含臨路寬度、臨路方向、道路使用現況或特殊道路限制。</small>}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function DataSummaryGrid({ items }) {
  return (
    <div className="eval-linked-data-grid">
      {items.map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value || "待補資料"}</strong>
        </article>
      ))}
    </div>
  );
}

function DocumentChecklist({ title = "應檢附文件", items }) {
  return (
    <div className="eval-document-checklist">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CapacitySelectField({ label, value, options, onChange, wide = false }) {
  return (
    <label className={`eval-field${wide ? " eval-field--wide" : ""}`}>
      <span>{label}</span>
      <select value={value ?? ""} onChange={onChange}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CapacityCheckboxField({ label, checked, onChange }) {
  return (
    <label className="eval-check-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function MissingDataNotice({ missingItems }) {
  if (!missingItems?.length) {
    return null;
  }

  return (
    <section className="eval-module-section eval-missing-data">
      <div className="eval-section-head">
        <h4>缺漏資料提醒</h4>
        <p>目前尚缺以下資料，暫不顯示完整初步數字：</p>
      </div>
      <ul>
        {missingItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ModuleSaveStatusBar({ saveStatus, onSave }) {
  const statusLabel = getModuleSaveStatusLabel(saveStatus);
  const savedAt = saveStatus?.savedAt || "尚未按下本模組儲存";

  return (
    <section className={`eval-module-section eval-module-save-status is-${saveStatus?.state ?? "ready"}`}>
      <div>
        <span>{statusLabel}</span>
        <small>最後儲存時間：{savedAt}</small>
      </div>
      <button type="button" onClick={onSave}>
        儲存本模組資料
      </button>
    </section>
  );
}

function CapacityCaseRequiredNotice({ onGoToCases }) {
  return (
    <section className="eval-module-section eval-case-required">
      <LockKeyhole aria-hidden="true" size={30} />
      <div>
        <p className="eval-kicker">CASE REQUIRED</p>
        <h4>請先建立或選擇案件，才能進行容積來源與獎勵試算。</h4>
        <p>容積試算必須掛在目前案件底下，並承接該案件的土地清冊、基地基本資料與開發路徑。</p>
        <button type="button" onClick={onGoToCases}>
          前往案件管理
        </button>
      </div>
    </section>
  );
}

function FloorEfficiencyCaseRequiredNotice({ onGoToCases }) {
  return (
    <section className="eval-module-section eval-case-required">
      <LockKeyhole aria-hidden="true" size={30} />
      <div>
        <p className="eval-kicker">CASE REQUIRED</p>
        <h4>請先建立或選擇案件，才能進行坪效明細計算。</h4>
        <p>坪效明細必須承接目前案件的清冊土地面積、基地基本資料與容積來源試算結果。</p>
        <button type="button" onClick={onGoToCases}>
          前往案件管理
        </button>
      </div>
    </section>
  );
}

function CapacityModule({
  currentCase,
  baseInfo,
  rosterStaging,
  capacityInputs,
  saveStatus,
  onCapacityInputsChange,
  onCapacityResultsChange,
  onMarkUnsaved,
  onSaveModule,
  onGoToCases,
}) {
  const effectiveInputs = useMemo(
    () => getEffectiveCapacityInputs(capacityInputs, baseInfo),
    [capacityInputs, baseInfo],
  );
  const capacityResult = useMemo(
    () => calculateCapacityResult(rosterStaging, baseInfo, effectiveInputs),
    [rosterStaging, baseInfo, effectiveInputs],
  );

  useEffect(() => {
    if (!currentCase) {
      return;
    }
    onCapacityResultsChange(capacityResult);
  }, [
    currentCase?.id,
    capacityResult.landAreaSqm,
    capacityResult.baseFloorAreaRatio,
    capacityResult.transferRatio,
    capacityResult.urbanRenewalCentralBonusRatio,
    capacityResult.urbanRenewalLocalBonusRatio,
    capacityResult.urbanRenewalBonusRatio,
    capacityResult.unsafeBuildingBonusRatio,
    capacityResult.incrementalCapacityRatio,
    capacityResult.otherBonusRatio,
    capacityResult.totalFloorAreaRatio,
    capacityResult.totalCapacityAreaSqm,
    capacityResult.assessedCurrentValueTotal,
    capacityResult.assessedCurrentValueWeightedUnit,
    capacityResult.assessedCurrentValueSourceStatus,
    capacityResult.baseCapacityAreaSqm,
    capacityResult.transferAreaSqm,
    capacityResult.urbanRenewalBonusAreaSqm,
    capacityResult.unsafeBuildingBonusAreaSqm,
    capacityResult.incrementalCapacityAreaSqm,
    capacityResult.otherBonusAreaSqm,
    capacityResult.calculationStatus,
    JSON.stringify(capacityResult.tdrScoringSummary),
  ]);

  if (!currentCase) {
    return (
      <div className="eval-module-stack">
        <CapacityCaseRequiredNotice onGoToCases={onGoToCases} />
      </div>
    );
  }

  const handleCapacityInputChange = (field) => (event) => {
    onMarkUnsaved();
    onCapacityInputsChange({
      ...defaultCapacityInputs,
      ...capacityInputs,
      [field]: event.target.value,
    });
  };

  const handleTdrScoringInputChange = (field) => (event) => {
    onMarkUnsaved();
    onCapacityInputsChange({
      ...defaultCapacityInputs,
      ...capacityInputs,
      tdrScoring: {
        ...defaultTdrScoringInputs,
        ...(isPlainRecord(capacityInputs?.tdrScoring) ? capacityInputs.tdrScoring : {}),
        [field]: event.target.value,
      },
    });
  };

  const handleTdrScoringCheckboxChange = (field) => (event) => {
    onMarkUnsaved();
    onCapacityInputsChange({
      ...defaultCapacityInputs,
      ...capacityInputs,
      tdrScoring: {
        ...defaultTdrScoringInputs,
        ...(isPlainRecord(capacityInputs?.tdrScoring) ? capacityInputs.tdrScoring : {}),
        [field]: event.target.checked,
      },
    });
  };

  const rosterSummary = buildRosterBaseSummary(rosterStaging);
  const tdrCostBasis = capacityResult.tdrCostBasis ?? {};
  const tdrScoring = effectiveInputs.tdrScoring ?? defaultTdrScoringInputs;
  const tdrScoringSummary = capacityResult.tdrScoringSummary ?? {};
  const effectiveRoadWidthValue = tdrScoring.roadWidthMeters || (Number.isFinite(tdrScoringSummary.roadWidthMeters) ? String(tdrScoringSummary.roadWidthMeters) : "");
  const totalCapacityBeforeTransferSqm = Number.isFinite(capacityResult.totalCapacityAreaSqm) && Number.isFinite(capacityResult.transferAreaSqm)
    ? capacityResult.totalCapacityAreaSqm - capacityResult.transferAreaSqm
    : null;
  const formatInputCurrency = (value) => {
    const parsedValue = parseNumericInput(value);
    return Number.isFinite(parsedValue) ? formatCurrencyTwd(parsedValue) : "待補資料";
  };
  const capacityFormulaNote = "各項獎勵、增額容積與容積移轉皆以基準容積量為計算基礎；畫面最後才格式化顯示。";
  const sourceItems = [
    ["地號筆數", rosterSummary.hasRoster ? rosterSummary.landNumberCount : "尚未上傳清冊"],
    ["土地面積合計", rosterSummary.landAreaSqm === null ? "待補資料" : formatSqmAndPing(rosterSummary.landAreaSqm)],
    ["使用分區", baseInfo.zoning || "尚未輸入"],
    ["建蔽率", baseInfo.buildingCoverageRatio || "尚未輸入"],
    ["基準容積率", effectiveInputs.baseFloorAreaRatio || "尚未輸入"],
    ["道路 / 臨路條件", baseInfo.roadAccess || "尚未輸入"],
    ["基地限制", baseInfo.siteRestrictions || "尚未輸入"],
    ["法規限制", baseInfo.legalRestrictions || "尚未輸入"],
  ];
  const baseCapacityItems = [
    ["土地面積合計", formatSqmAndPing(capacityResult.landAreaSqm)],
    ["基準容積率", formatPercentValue(capacityResult.baseFloorAreaRatio)],
    ["基準容積量", formatSqmAndPing(capacityResult.baseCapacityAreaSqm)],
  ];
  const urbanRenewalItems = [
    ["中央獎勵", Number.isFinite(capacityResult.urbanRenewalCentralBonusRatio) ? formatPercentValue(capacityResult.urbanRenewalCentralBonusRatio) : "未拆分"],
    ["地方獎勵", Number.isFinite(capacityResult.urbanRenewalLocalBonusRatio) ? formatPercentValue(capacityResult.urbanRenewalLocalBonusRatio) : "未拆分"],
    ["合計比例", formatPercentValue(capacityResult.urbanRenewalBonusRatio)],
    ["增加量", formatSqmAndPing(capacityResult.urbanRenewalBonusAreaSqm)],
  ];
  const unsafeBuildingItems = [
    ["是否適用", effectiveInputs.unsafeBuildingApplicable || (capacityResult.unsafeBuildingBonusRatio > 0 ? "是" : "待確認 / 目前未列入")],
    ["獎勵比例", formatPercentValue(capacityResult.unsafeBuildingBonusRatio)],
    ["增加量", formatSqmAndPing(capacityResult.unsafeBuildingBonusAreaSqm)],
  ];
  const otherBonusItems = [
    ["獎勵比例", formatPercentValue(capacityResult.otherBonusRatio)],
    ["增加量", formatSqmAndPing(capacityResult.otherBonusAreaSqm)],
    ["說明", effectiveInputs.otherCapacitySourceNote || "待補資料"],
  ];
  const incrementalCapacityItems = [
    ["是否適用", effectiveInputs.incrementalCapacityApplicable || (capacityResult.incrementalCapacityRatio > 0 ? "是" : "待確認 / 目前未列入")],
    ["增額比例", formatPercentValue(capacityResult.incrementalCapacityRatio)],
    ["增額容積量", formatSqmAndPing(capacityResult.incrementalCapacityAreaSqm)],
    ["增額價金狀態", effectiveInputs.incrementalCapacityPriceStatus || "待主管機關估價與審議確認"],
    ["回饋事項", effectiveInputs.incrementalCapacityFeedback || "待補資料"],
  ];
  const tdrLimitItems = [
    ["接受基地道路寬度", effectiveInputs.tdrRoadWidthStatus || "待評點 / 待確認"],
    ["基地評點狀態", effectiveInputs.tdrSiteScoreStatus || "可移入上限待評點 / 待審查確認"],
    ["目標容移比例", formatPercentValue(capacityResult.transferRatio)],
    ["目標容移量", formatSqmAndPing(capacityResult.transferAreaSqm)],
  ];
  const tdrDonationItems = [
    ["送出基地公告土地現值", Number.isFinite(tdrCostBasis.donorAssessedCurrentValue) ? formatCurrencyTwdPerSqm(tdrCostBasis.donorAssessedCurrentValue) : "待補資料"],
    ["接受基地公告土地現值", Number.isFinite(tdrCostBasis.recipientAssessedCurrentValue) ? formatCurrencyTwdPerSqm(tdrCostBasis.recipientAssessedCurrentValue) : "待補資料"],
    ["接受基地容積率", formatPercentValue(tdrCostBasis.recipientFloorAreaRatio)],
    ["目標移入容積", formatSqmAndPing(capacityResult.transferAreaSqm)],
    ["反推所需送出基地面積", formatSqmAndPing(tdrCostBasis.requiredDonorLandAreaSqm)],
    ["所需送出基地坪數", Number.isFinite(tdrCostBasis.requiredDonorLandAreaPing) ? `${formatPing(tdrCostBasis.requiredDonorLandAreaPing)} 坪` : "待補資料"],
    ["購地成本：坪數 × 市場行情單價", formatCurrencyTwd(tdrCostBasis.marketPriceCost)],
    ["購地成本：公告現值總額 × 行情係數", formatCurrencyTwd(tdrCostBasis.assessedValueMultiplierCost)],
    ["代書費", formatInputCurrency(effectiveInputs.tdrScrivenerFee)],
    ["容移申請 / 捐贈代辦費", formatInputCurrency(effectiveInputs.tdrDonationAgencyFee)],
    ["其他費用", formatInputCurrency(effectiveInputs.tdrOtherFee)],
  ];
  const tdrCashPaymentItems = [
    ["目標移入容積", formatSqmAndPing(capacityResult.transferAreaSqm)],
    ["容移前總樓地板面積", formatSqmAndPing(totalCapacityBeforeTransferSqm)],
    ["容移後總樓地板面積", formatSqmAndPing(capacityResult.totalCapacityAreaSqm)],
    ["估價方式", effectiveInputs.tdrAppraisalMethodNote || "土地開發分析法為主；比較法參酌；收益法暫不列入正式計算"],
    ["估價師估價費", formatInputCurrency(effectiveInputs.tdrAppraiserFee)],
    ["容積申請代辦費", formatInputCurrency(effectiveInputs.tdrCashPaymentAgencyFee)],
    ["容積移轉代金狀態", effectiveInputs.tdrCashPaymentStatus || "待主管機關估價與審議確認"],
  ];
  const tdrRoadPrecheckItems = [
    ["接受基地連接道路寬度", Number.isFinite(tdrScoringSummary.roadWidthMeters) ? `${formatNumber(tdrScoringSummary.roadWidthMeters, 2)} 公尺` : "待補資料"],
    ["臨路條件初判積分 / 初判可移入比例", Number.isFinite(tdrScoringSummary.roadPrecheckPercentage) ? formatPercentValue(tdrScoringSummary.roadPrecheckPercentage) : "待補資料"],
    ["臨路條件狀態", tdrScoringSummary.roadPrecheckStatus],
    ["目標容積移轉比例", formatPercentValue(capacityResult.transferRatio)],
  ];
  const tdrSiteCompletenessItems = [
    ["基地面積級距", tdrScoringSummary.siteAreaBand],
    ["基地最小邊長", tdrScoreOptions.minimumSideLengthBand.find(([value]) => value === tdrScoring.minimumSideLengthBand)?.[1] || "待輸入"],
    ["內角是否介於 60 至 120 度", tdrScoring.interiorAnglesQualified ? "+1" : "未勾選"],
    ["臨接道路條件", tdrScoring.adjacentRoadCondition ? tdrScoreOptions.adjacentRoadCondition.find(([value]) => value === tdrScoring.adjacentRoadCondition)?.[1] : "依道路寬度自動初判"],
    ["小計", formatPercentValue(tdrScoringSummary.siteCompletenessSubtotal)],
  ];
  const tdrSurroundingItems = [
    ["基地境界線最小退縮距離", tdrScoreOptions.boundarySetback.find(([value]) => value === tdrScoring.boundarySetback)?.[1] || "待輸入"],
    ["現況公共設施面積", tdrScoreOptions.publicFacilityArea.find(([value]) => value === tdrScoring.publicFacilityArea)?.[1] || "待輸入"],
    ["TOD 規劃距離", tdrScoreOptions.todDistance.find(([value]) => value === tdrScoring.todDistance)?.[1] || "待輸入"],
    ["小計", formatPercentValue(tdrScoringSummary.surroundingSubtotal)],
  ];
  const tdrSendingSiteItems = [
    ["連接接受基地面積占比", tdrScoreOptions.ratioScore.find(([value]) => value === tdrScoring.connectedLandRatio)?.[1] || "待輸入"],
    ["公共設施面積占比", tdrScoreOptions.ratioScore.find(([value]) => value === tdrScoring.publicFacilityRatio)?.[1] || "待輸入"],
    ["優先取得公共設施用地", tdrScoreOptions.priorityRatioScore.find(([value]) => value === tdrScoring.priorityPublicFacilityRatio)?.[1] || "待輸入"],
    ["公告取得方式手動分數", formatPercentValue(clampScore(tdrScoring.announcedAcquisitionScore, 0, 3, 0))],
    ["全持分已開闢道路", tdrScoring.fullOwnershipOpenedRoad ? "+1" : "未勾選"],
    ["百分之百折繳代金", tdrScoring.fullCashPayment ? "+10，其他送出基地位置項目不適用" : "未勾選"],
    ["小計", formatPercentValue(tdrScoringSummary.sendingSiteSubtotal)],
  ];
  const tdrOpenSpaceItems = [
    ["廣場式開放空間比例", tdrScoreOptions.plazaOpenSpaceRatio.find(([value]) => value === tdrScoring.plazaOpenSpaceRatio)?.[1] || "待輸入"],
    ["沿街步道式開放空間條件", tdrScoreOptions.sidewalkOpenSpaceCondition.find(([value]) => value === tdrScoring.sidewalkOpenSpaceCondition)?.[1] || "待輸入"],
    ["小計", formatPercentValue(tdrScoringSummary.openSpaceSubtotal)],
  ];
  const tdrWelfareItems = [
    ["捐贈社會住宅", tdrScoring.donateSocialHousing ? "+2" : "未勾選"],
    ["捐贈公共托育設施", tdrScoring.donateChildcare ? "+2" : "未勾選"],
    ["捐贈老人安養設施", tdrScoring.donateElderlyCare ? "+2" : "未勾選"],
    ["小計", formatPercentValue(tdrScoringSummary.welfareSubtotal)],
  ];
  const tdrExternalItems = [
    ["公共設施改善計畫小計", formatPercentValue(tdrScoringSummary.publicFacilityImprovementSubtotal)],
    ["環境改善價金積分", formatPercentValue(tdrScoringSummary.environmentImprovementScore)],
    ["環境改善價金試算", formatCurrencyTwd(tdrScoringSummary.environmentImprovementPrice)],
    ["綠色交通小計", formatPercentValue(tdrScoringSummary.greenTransportSubtotal)],
    ["預估設施建置及維護費用", formatCurrencyTwd(tdrScoringSummary.greenTransportEstimatedCost)],
    ["是否需加倍留設", tdrScoringSummary.greenTransportNeedsDouble ? "是，暫以 4,000,000 元提示，待正式確認" : "否 / 尚未達加倍條件"],
    ["外部環境改善原始小計", formatPercentValue(tdrScoringSummary.externalRawSubtotal)],
    ["外部環境改善可採計上限", formatPercentValue(tdrScoringSummary.externalAdoptableLimit)],
    ["外部環境改善採計分數", formatPercentValue(tdrScoringSummary.externalAdoptedScore)],
  ];
  const tdrScoringSummaryItems = [
    ["臨路條件初判分數 / 比例", Number.isFinite(tdrScoringSummary.roadPrecheckPercentage) ? formatPercentValue(tdrScoringSummary.roadPrecheckPercentage) : "待補資料"],
    ["接受基地內部條件小計", formatPercentValue(tdrScoringSummary.internalSubtotal)],
    ["送出基地位置小計", formatPercentValue(tdrScoringSummary.sendingSiteSubtotal)],
    ["地面層開放空間小計", formatPercentValue(tdrScoringSummary.openSpaceSubtotal)],
    ["公益性設施小計", formatPercentValue(tdrScoringSummary.welfareSubtotal)],
    ["接受基地外部環境改善原始小計", formatPercentValue(tdrScoringSummary.externalRawSubtotal)],
    ["外部環境改善可採計上限", formatPercentValue(tdrScoringSummary.externalAdoptableLimit)],
    ["外部環境改善實際採計", formatPercentValue(tdrScoringSummary.externalAdoptedScore)],
    ["評點初算合計", formatPercentValue(tdrScoringSummary.preliminaryTotalScore)],
    ["目標容積移轉比例", formatPercentValue(tdrScoringSummary.targetTransferRatio)],
    ["評點狀態", tdrScoringSummary.scoringStatus],
  ];
  const resultItems = [
    ["基準容積量", formatSqmAndPing(capacityResult.baseCapacityAreaSqm)],
    ["都市更新獎勵量", formatSqmAndPing(capacityResult.urbanRenewalBonusAreaSqm)],
    ["危老獎勵量", formatSqmAndPing(capacityResult.unsafeBuildingBonusAreaSqm)],
    ["增額容積量", formatSqmAndPing(capacityResult.incrementalCapacityAreaSqm)],
    ["容積移轉量", formatSqmAndPing(capacityResult.transferAreaSqm)],
    ["其他獎勵量", formatSqmAndPing(capacityResult.otherBonusAreaSqm)],
    ["總容積量", formatSqmAndPing(capacityResult.totalCapacityAreaSqm)],
    ["總容積率", formatPercentValue(capacityResult.totalFloorAreaRatio)],
    ["計算狀態", capacityResult.calculationStatus],
  ];
  return (
    <div className="eval-module-stack">
      <CurrentCaseSummary currentCase={currentCase} />
      <ModuleSaveStatusBar saveStatus={saveStatus} onSave={onSaveModule} />
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>前置資料摘要</h4>
          <p>本區承接目前案件的清冊土地面積與基地基本資料；缺漏處顯示待補資料，不放假數字。</p>
        </div>
        <DataSummaryGrid items={sourceItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>一、基準容積</h4>
          <p>基準容積量由土地面積與基準容積率推得，作為後續都市更新、危老、增額、容積移轉與其他獎勵的共同計算基礎。</p>
        </div>
        <div className="eval-field-grid eval-linked-input-grid">
          <label className="eval-field">
            <span>基準容積率（%）</span>
            <input type="text" value={effectiveInputs.baseFloorAreaRatio} onChange={handleCapacityInputChange("baseFloorAreaRatio")} placeholder="例：200%" />
            <small>{capacityInputs?.baseFloorAreaRatio ? "來源：本模組調整值" : "來源：基地基本資料，可在此調整"}</small>
          </label>
        </div>
        <DataSummaryGrid items={baseCapacityItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>二、獎勵容積</h4>
          <p>{capacityFormulaNote}</p>
        </div>
        <div className="eval-capacity-subsection">
          <h5>都市更新獎勵</h5>
          <div className="eval-field-grid eval-linked-input-grid">
            <label className="eval-field">
              <span>中央獎勵（%）</span>
              <input type="text" value={effectiveInputs.urbanRenewalCentralBonusRatio} onChange={handleCapacityInputChange("urbanRenewalCentralBonusRatio")} placeholder="例：30%" />
            </label>
            <label className="eval-field">
              <span>地方獎勵（%）</span>
              <input type="text" value={effectiveInputs.urbanRenewalLocalBonusRatio} onChange={handleCapacityInputChange("urbanRenewalLocalBonusRatio")} placeholder="例：20%" />
            </label>
            <label className="eval-field">
              <span>合計比例（未拆分時使用，%）</span>
              <input type="text" value={effectiveInputs.urbanRenewalBonusRatio} onChange={handleCapacityInputChange("urbanRenewalBonusRatio")} placeholder="例：50%" />
            </label>
          </div>
          <DataSummaryGrid items={urbanRenewalItems} />
        </div>
        <div className="eval-capacity-subsection">
          <h5>危老獎勵</h5>
          <div className="eval-field-grid eval-linked-input-grid">
            <label className="eval-field">
              <span>是否適用</span>
              <input type="text" value={effectiveInputs.unsafeBuildingApplicable} onChange={handleCapacityInputChange("unsafeBuildingApplicable")} placeholder="例：否 / 待確認" />
            </label>
            <label className="eval-field">
              <span>獎勵比例（%）</span>
              <input type="text" value={effectiveInputs.unsafeBuildingBonusRatio} onChange={handleCapacityInputChange("unsafeBuildingBonusRatio")} placeholder="例：0%" />
            </label>
          </div>
          <DataSummaryGrid items={unsafeBuildingItems} />
        </div>
        <div className="eval-capacity-subsection">
          <h5>其他 / 規模獎勵</h5>
          <div className="eval-field-grid eval-linked-input-grid">
            <label className="eval-field">
              <span>獎勵比例（%）</span>
              <input type="text" value={effectiveInputs.otherBonusRatio} onChange={handleCapacityInputChange("otherBonusRatio")} placeholder="例：0%" />
            </label>
            <label className="eval-field eval-field--wide">
              <span>其他容積來源說明</span>
              <input type="text" value={effectiveInputs.otherCapacitySourceNote} onChange={handleCapacityInputChange("otherCapacitySourceNote")} placeholder="補充容積來源、限制或待確認事項" />
            </label>
          </div>
          <DataSummaryGrid items={otherBonusItems} />
        </div>
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>三、增額容積</h4>
          <p>增額容積價金需依主管機關估價與審議結果確認，目前僅作前期試算。</p>
        </div>
        <div className="eval-field-grid eval-linked-input-grid">
          <label className="eval-field">
            <span>是否適用</span>
            <input type="text" value={effectiveInputs.incrementalCapacityApplicable} onChange={handleCapacityInputChange("incrementalCapacityApplicable")} placeholder="例：否 / 待確認" />
          </label>
          <label className="eval-field">
            <span>增額比例（%）</span>
            <input type="text" value={effectiveInputs.incrementalCapacityRatio} onChange={handleCapacityInputChange("incrementalCapacityRatio")} placeholder="例：0%" />
          </label>
          <label className="eval-field">
            <span>增額價金狀態</span>
            <input type="text" value={effectiveInputs.incrementalCapacityPriceStatus} onChange={handleCapacityInputChange("incrementalCapacityPriceStatus")} placeholder="例：待主管機關估價" />
          </label>
          <label className="eval-field eval-field--wide">
            <span>回饋事項</span>
            <input type="text" value={effectiveInputs.incrementalCapacityFeedback} onChange={handleCapacityInputChange("incrementalCapacityFeedback")} placeholder="補充回饋項目、估價或審議待確認事項" />
          </label>
        </div>
        <DataSummaryGrid items={incrementalCapacityItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>四、容積移轉</h4>
          <p>容積移轉比例為前期試算目標；實際可移入上限仍須依接受基地條件、道路寬度、容積量體評定及主管機關審查確認。</p>
        </div>
        <div className="eval-capacity-subsection">
          <h5>第一層：可移入上限與目標容移量</h5>
          <div className="eval-field-grid eval-linked-input-grid">
            <label className="eval-field">
              <span>接受基地道路寬度</span>
              <input type="text" value={effectiveInputs.tdrRoadWidthStatus} onChange={handleCapacityInputChange("tdrRoadWidthStatus")} placeholder="例：待評點" />
            </label>
            <label className="eval-field">
              <span>基地評點狀態</span>
              <input type="text" value={effectiveInputs.tdrSiteScoreStatus} onChange={handleCapacityInputChange("tdrSiteScoreStatus")} placeholder="例：可移入上限待評點 / 待審查確認" />
            </label>
            <label className="eval-field">
              <span>目標容移比例（%）</span>
              <input type="text" value={effectiveInputs.transferRatio} onChange={handleCapacityInputChange("transferRatio")} placeholder="例：30%" />
            </label>
          </div>
          <DataSummaryGrid items={tdrLimitItems} />
        </div>
        <div className="eval-capacity-method-grid">
          <article className="eval-capacity-method-card">
            <h5>A. 捐贈公設地方式</h5>
            <div className="eval-field-grid eval-linked-input-grid">
              <label className="eval-field">
                <span>送出基地公告土地現值</span>
                <input type="text" value={effectiveInputs.tdrDonorAssessedCurrentValue} onChange={handleCapacityInputChange("tdrDonorAssessedCurrentValue")} placeholder="例：100000" />
              </label>
              <label className="eval-field">
                <span>接受基地公告土地現值</span>
                <input type="text" value={effectiveInputs.tdrRecipientAssessedCurrentValue} onChange={handleCapacityInputChange("tdrRecipientAssessedCurrentValue")} placeholder="預設引用本案加權平均單價" />
              </label>
              <label className="eval-field">
                <span>接受基地容積率（%）</span>
                <input type="text" value={effectiveInputs.tdrRecipientFloorAreaRatio} onChange={handleCapacityInputChange("tdrRecipientFloorAreaRatio")} placeholder="例：200%" />
              </label>
              <label className="eval-field">
                <span>市場行情單價（元 / 坪）</span>
                <input type="text" value={effectiveInputs.tdrMarketUnitPricePerPing} onChange={handleCapacityInputChange("tdrMarketUnitPricePerPing")} placeholder="估算方式一" />
              </label>
              <label className="eval-field">
                <span>行情係數</span>
                <input type="text" value={effectiveInputs.tdrMarketPriceMultiplier} onChange={handleCapacityInputChange("tdrMarketPriceMultiplier")} placeholder="估算方式二" />
              </label>
              <label className="eval-field">
                <span>代書費</span>
                <input type="text" value={effectiveInputs.tdrScrivenerFee} onChange={handleCapacityInputChange("tdrScrivenerFee")} placeholder="例：50000" />
              </label>
              <label className="eval-field">
                <span>容移申請 / 捐贈代辦費</span>
                <input type="text" value={effectiveInputs.tdrDonationAgencyFee} onChange={handleCapacityInputChange("tdrDonationAgencyFee")} placeholder="例：300000" />
              </label>
              <label className="eval-field">
                <span>其他費用</span>
                <input type="text" value={effectiveInputs.tdrOtherFee} onChange={handleCapacityInputChange("tdrOtherFee")} placeholder="例：0" />
              </label>
            </div>
            <DataSummaryGrid items={tdrDonationItems} />
            <p className="eval-capacity-method-note">接受基地移入容積 = 送出基地土地面積 ×（送出基地公告土地現值 ÷ 接受基地公告土地現值）× 接受基地容積率。此為內部快速估算，正式仍以實際送出基地、公告現值、成交條件與容移審查結果為準。</p>
          </article>
          <article className="eval-capacity-method-card">
            <h5>B. 折繳代金方式</h5>
            <div className="eval-field-grid eval-linked-input-grid">
              <label className="eval-field eval-field--wide">
                <span>估價方式備註</span>
                <input type="text" value={effectiveInputs.tdrAppraisalMethodNote} onChange={handleCapacityInputChange("tdrAppraisalMethodNote")} placeholder="土地開發分析法為主；比較法參酌；收益法暫不列入正式計算" />
              </label>
              <label className="eval-field">
                <span>估價師估價費</span>
                <input type="text" value={effectiveInputs.tdrAppraiserFee} onChange={handleCapacityInputChange("tdrAppraiserFee")} placeholder="例：0" />
              </label>
              <label className="eval-field">
                <span>容積申請代辦費</span>
                <input type="text" value={effectiveInputs.tdrCashPaymentAgencyFee} onChange={handleCapacityInputChange("tdrCashPaymentAgencyFee")} placeholder="例：0" />
              </label>
              <label className="eval-field">
                <span>容積移轉代金狀態</span>
                <input type="text" value={effectiveInputs.tdrCashPaymentStatus} onChange={handleCapacityInputChange("tdrCashPaymentStatus")} placeholder="待主管機關估價與審議確認" />
              </label>
            </div>
            <DataSummaryGrid items={tdrCashPaymentItems} />
            <div className="eval-reference-grid">
              <span>土地開發分析法：主要</span>
              <span>比較法：參酌</span>
              <span>收益法：暫不列入正式計算，可保留備註</span>
            </div>
            <p className="eval-capacity-method-note">折繳代金需依主管機關估價與審議結果確認，目前不硬寫正式代金公式。</p>
          </article>
        </div>
        <div className="eval-capacity-subsection eval-tdr-scoring">
          <h5>容積移轉量體評點檢核（112 年 1 月 1 日以後）</h5>
          <p className="eval-capacity-method-note">來源：容積移轉申請移入容積量體評點項目查核表。本區為前期檢核工具，正式仍須建築師簽證及主管機關審查確認。</p>
          <DataSummaryGrid items={tdrScoringSummaryItems} />
          <div className="eval-capacity-subsection">
            <h5>一、臨路條件初判</h5>
            <div className="eval-field-grid eval-linked-input-grid">
              <label className="eval-field">
                <span>接受基地連接道路寬度（公尺）</span>
                <input type="text" value={effectiveRoadWidthValue} onChange={handleTdrScoringInputChange("roadWidthMeters")} placeholder="例：15" />
                <small>{tdrScoring.roadWidthMeters ? "來源：本模組評點檢核" : "未輸入時會嘗試由容積移轉道路欄位或基地基本資料的道路 / 臨路條件帶入"}</small>
              </label>
            </div>
            <DataSummaryGrid items={tdrRoadPrecheckItems} />
            <p className="eval-capacity-method-note">{tdrScoringSummary.roadTargetNotice}</p>
            <DocumentChecklist items={tdrScoringDocuments.road} />
          </div>
          <div className="eval-capacity-subsection">
            <h5>二、接受基地內部條件</h5>
            <div className="eval-capacity-method-grid">
              <article className="eval-capacity-method-card">
                <h5>A. 基地大小及完整性</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="基地最小邊長" value={tdrScoring.minimumSideLengthBand} options={tdrScoreOptions.minimumSideLengthBand} onChange={handleTdrScoringInputChange("minimumSideLengthBand")} />
                  <CapacitySelectField label="臨接道路條件" value={tdrScoring.adjacentRoadCondition} options={tdrScoreOptions.adjacentRoadCondition} onChange={handleTdrScoringInputChange("adjacentRoadCondition")} />
                </div>
                <div className="eval-check-grid">
                  <CapacityCheckboxField label="基地各內角介於 60 至 120 度：+1" checked={tdrScoring.interiorAnglesQualified} onChange={handleTdrScoringCheckboxChange("interiorAnglesQualified")} />
                </div>
                <DataSummaryGrid items={tdrSiteCompletenessItems} />
                <p className="eval-capacity-method-note">甲一至甲六目前僅作基地面積級距分類，不硬寫正式分數。</p>
                <DocumentChecklist items={tdrScoringDocuments.siteCompleteness} />
              </article>
              <article className="eval-capacity-method-card">
                <h5>B. 周邊鄰地建築物現況與公共設施</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="基地境界線最小退縮距離" value={tdrScoring.boundarySetback} options={tdrScoreOptions.boundarySetback} onChange={handleTdrScoringInputChange("boundarySetback")} />
                  <CapacitySelectField label="現況公共設施面積" value={tdrScoring.publicFacilityArea} options={tdrScoreOptions.publicFacilityArea} onChange={handleTdrScoringInputChange("publicFacilityArea")} />
                  <CapacitySelectField label="TOD 規劃距離" value={tdrScoring.todDistance} options={tdrScoreOptions.todDistance} onChange={handleTdrScoringInputChange("todDistance")} />
                </div>
                <DataSummaryGrid items={tdrSurroundingItems} />
                <DocumentChecklist items={tdrScoringDocuments.surrounding} />
              </article>
              <article className="eval-capacity-method-card">
                <h5>C. 送出基地位置</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="連接接受基地面積占送出基地總面積比率" value={tdrScoring.connectedLandRatio} options={tdrScoreOptions.ratioScore} onChange={handleTdrScoringInputChange("connectedLandRatio")} />
                  <CapacitySelectField label="公共設施面積占送出基地總面積比率" value={tdrScoring.publicFacilityRatio} options={tdrScoreOptions.ratioScore} onChange={handleTdrScoringInputChange("publicFacilityRatio")} />
                  <CapacitySelectField label="本府公告應優先取得公共設施用地" value={tdrScoring.priorityPublicFacilityRatio} options={tdrScoreOptions.priorityRatioScore} onChange={handleTdrScoringInputChange("priorityPublicFacilityRatio")} />
                  <label className="eval-field">
                    <span>本府公告取得方式手動積分（1 至 3）</span>
                    <input type="text" value={tdrScoring.announcedAcquisitionScore} onChange={handleTdrScoringInputChange("announcedAcquisitionScore")} placeholder="例：1、2 或 3" />
                  </label>
                </div>
                <div className="eval-check-grid">
                  <CapacityCheckboxField label="全持分已開闢道路，且達送出基地總面積 50% 以上：+1" checked={tdrScoring.fullOwnershipOpenedRoad} onChange={handleTdrScoringCheckboxChange("fullOwnershipOpenedRoad")} />
                  <CapacityCheckboxField label="百分之百折繳代金方式辦理：+10" checked={tdrScoring.fullCashPayment} onChange={handleTdrScoringCheckboxChange("fullCashPayment")} />
                </div>
                <DataSummaryGrid items={tdrSendingSiteItems} />
                <DocumentChecklist items={tdrScoringDocuments.sendingSite} />
              </article>
              <article className="eval-capacity-method-card">
                <h5>D. 地面層開放空間</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="廣場式開放空間比例" value={tdrScoring.plazaOpenSpaceRatio} options={tdrScoreOptions.plazaOpenSpaceRatio} onChange={handleTdrScoringInputChange("plazaOpenSpaceRatio")} />
                  <CapacitySelectField label="沿街步道式開放空間條件" value={tdrScoring.sidewalkOpenSpaceCondition} options={tdrScoreOptions.sidewalkOpenSpaceCondition} onChange={handleTdrScoringInputChange("sidewalkOpenSpaceCondition")} />
                </div>
                <DataSummaryGrid items={tdrOpenSpaceItems} />
                <p className="eval-capacity-method-note">開放空間不得與開放空間獎勵、法定退縮範圍重複計算；正式仍須建築師檢討與簽證。</p>
                <DocumentChecklist items={tdrScoringDocuments.openSpace} />
              </article>
              <article className="eval-capacity-method-card">
                <h5>E. 捐贈接受基地內部公益性設施</h5>
                <div className="eval-check-grid">
                  <CapacityCheckboxField label="捐贈社會住宅：+2" checked={tdrScoring.donateSocialHousing} onChange={handleTdrScoringCheckboxChange("donateSocialHousing")} />
                  <CapacityCheckboxField label="捐贈公共托育設施：+2" checked={tdrScoring.donateChildcare} onChange={handleTdrScoringCheckboxChange("donateChildcare")} />
                  <CapacityCheckboxField label="捐贈老人安養設施：+2" checked={tdrScoring.donateElderlyCare} onChange={handleTdrScoringCheckboxChange("donateElderlyCare")} />
                </div>
                <DataSummaryGrid items={tdrWelfareItems} />
                <p className="eval-capacity-method-note">接受基地規模應達 3,000㎡ 以上；相關出入口、停車位、樓層高度、管理維護基金及接管機關同意，仍須依正式規定檢討。</p>
                <DocumentChecklist items={tdrScoringDocuments.welfare} />
              </article>
            </div>
          </div>
          <div className="eval-capacity-subsection">
            <h5>三、接受基地外部環境改善項目</h5>
            <p className="eval-capacity-method-note">接受基地外部環境改善項目積分不可超過接受基地內部條件積分之 1/3。</p>
            <div className="eval-capacity-method-grid">
              <article className="eval-capacity-method-card">
                <h5>A. 公共設施改善計畫</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="協助開闢綠地、計畫道路等公共設施位置" value={tdrScoring.publicFacilityImprovementLocation} options={tdrScoreOptions.publicFacilityImprovementLocation} onChange={handleTdrScoringInputChange("publicFacilityImprovementLocation")} wide />
                </div>
                <p className="eval-capacity-method-note">開闢面積應大於 1/2 申請移入容積樓地板面積，且在 500㎡ 以上；正式仍須權管機關同意。</p>
                <DocumentChecklist items={tdrScoringDocuments.publicFacilityImprovement} />
              </article>
              <article className="eval-capacity-method-card">
                <h5>B. 提供環境改善價金</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <label className="eval-field">
                    <span>積分數（1 至 8，整數）</span>
                    <input type="text" value={tdrScoring.environmentImprovementScore} onChange={handleTdrScoringInputChange("environmentImprovementScore")} placeholder="例：1" />
                  </label>
                </div>
                <p className="eval-capacity-method-note">環境改善價金 = 接受基地面積（㎡）× 接受基地法定容積率 × 1.31 × 20,000 元 × 積分數。法定容積率 200% 會以 2.0 計算。</p>
                <p className="eval-capacity-method-note">此為依檢核表公式之內部前期試算；正式金額仍以主管機關審查、建築師簽證及相關文件為準。</p>
                <DocumentChecklist items={tdrScoringDocuments.environmentPrice} />
              </article>
              <article className="eval-capacity-method-card">
                <h5>C. 綠色交通</h5>
                <div className="eval-check-grid">
                  <CapacityCheckboxField label="提供公共自行車或公車候車亭（智慧站牌）留設位置及相關設施設備：+1" checked={tdrScoring.greenTransportProvided} onChange={handleTdrScoringCheckboxChange("greenTransportProvided")} />
                  <CapacityCheckboxField label="基準容積外增加容積樓地板面積達 6,000㎡ 以上，需加倍留設" checked={tdrScoring.greenTransportAddedCapacityOver6000} onChange={handleTdrScoringCheckboxChange("greenTransportAddedCapacityOver6000")} />
                </div>
                <p className="eval-capacity-method-note">設施建置及維護費用先顯示 2,000,000 元；若達 6,000㎡ 以上，暫以 4,000,000 元提示，待正式確認。</p>
                <DocumentChecklist items={tdrScoringDocuments.greenTransport} />
              </article>
            </div>
            <DataSummaryGrid items={tdrExternalItems} />
          </div>
          <details className="eval-document-total">
            <summary>應檢附文件總表</summary>
            <DocumentChecklist title="文件總表" items={tdrScoringMasterDocuments} />
          </details>
        </div>
      </section>
      <MissingDataNotice missingItems={capacityResult.missingItems} />
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>五、總容積結果</h4>
          <p>此為前端測試用初步試算，正式公式與法規適用仍待確認。</p>
        </div>
        <DataSummaryGrid items={resultItems} />
      </section>
      <section className="eval-module-section eval-formula-note">
        <h4>測試用簡化公式 / 正式公式待確認</h4>
        <p>基準容積量 = 土地面積合計 × 基準容積率 / 100；都市更新獎勵、危老獎勵、增額容積、容積移轉與其他獎勵量 = 基準容積量 × 該比例 / 100；總容積量 = 基準容積量 + 各項獎勵 / 增額 / 容移量；總容積率 = 總容積量 ÷ 土地面積合計 × 100。</p>
        <p>本模組結果將提供坪效明細、成本與共同負擔、銷售情境、權利分配、現金流與銀行融資報告引用。</p>
      </section>
    </div>
  );
}

function FloorEfficiencyModule({
  currentCase,
  rosterStaging,
  baseInfo,
  capacityResult,
  floorParams,
  saveStatus,
  onFloorParamsChange,
  onFloorResultsChange,
  onMarkUnsaved,
  onSaveModule,
  onGoToCases,
}) {
  const effectiveParams = useMemo(
    () => getEffectiveFloorEfficiencyParams(floorParams, capacityResult),
    [floorParams, capacityResult],
  );
  const floorResult = useMemo(
    () => calculateFloorEfficiencyResult(rosterStaging, baseInfo, capacityResult, effectiveParams),
    [rosterStaging, baseInfo, capacityResult, effectiveParams],
  );

  useEffect(() => {
    if (!currentCase) {
      return;
    }
    onFloorResultsChange(floorResult);
  }, [
    currentCase?.id,
    floorResult.landAreaSqm,
    floorResult.allowedCapacityAreaSqm,
    floorResult.totalFloorAreaSqm,
    floorResult.saleableAreaSqm,
    floorResult.publicAreaSqm,
    floorResult.buildPingPerLandPing,
    floorResult.saleablePingPerLandPing,
    floorResult.assessedCurrentValueTotal,
    floorResult.assessedCurrentValueWeightedUnit,
    floorResult.assessedCurrentValueSourceStatus,
    floorResult.calculationStatus,
  ]);

  if (!currentCase) {
    return (
      <div className="eval-module-stack">
        <FloorEfficiencyCaseRequiredNotice onGoToCases={onGoToCases} />
      </div>
    );
  }

  const handleFloorParamChange = (field) => (event) => {
    onMarkUnsaved();
    onFloorParamsChange({
      ...defaultFloorEfficiencyParams,
      ...floorParams,
      [field]: event.target.value,
    });
  };

  const formulaRateFields = [
    ["simpleUrbanRenewalBonusRate", "簡易都更獎勵比例（%）", "例：20%"],
    ["landUseBonusRate", "土管 / 規模獎勵比例（%）", "例：0%"],
    ["tdrRate", "容積移轉比例（%）", "例：30%"],
    ["urbanRenewalBonusRate", "都市更新獎勵比例（%）", "例：20%"],
    ["dangerousOldBuildingBonusRate", "危老獎勵比例（%）", "例：10%"],
    ["equipmentExemptionRate", "設備空間免計比例（%）", "例：15%"],
    ["lobbyRate", "梯廳比例（%）", "例：10%"],
    ["balconyRate", "陽台比例（%）", "例：5%"],
    ["roofProjectionRate", "屋突比例（%）", "例：12.5%"],
    ["rainShelterRate", "雨遮面積比例（%）", "例：0%"],
    ["buildingEnvelopeRate", "外皮面積比例（%）", "例：0%"],
    ["publicServiceRate", "公共服務空間比例（%）", "例：0%"],
  ];
  const formulaScaleFields = [
    ["basementMultiplier", "地下層面積倍數", "例：0.7"],
    ["undergroundFloors", "地下層數", "例：4"],
    ["parkingUnitAreaPing", "車位單位面積（坪 / 位）", "例：12"],
    ["selfParkingCount", "自設汽車位數", "例：50"],
    ["motorcycleParkingCount", "機車位數", "例：0"],
    ["bikeParkingCount", "自行車位數", "例：0"],
    ["saleableAdjustmentRatio", "銷售面積校正比例（%）", "例：100%"],
    ["publicAreaRatio", "目標公設比（%）", "例：35%"],
  ];
  const sourceItems = [
    ["目前案件", `${currentCase.code} / ${currentCase.name}`],
    ["地號筆數", floorResult.landNumberCount || "待清冊補齊"],
    ["地號清單", floorResult.landNumberDisplay],
    ["土地面積合計", formatSqmAndPing(floorResult.landAreaSqm)],
    ["公告現值總額", formatCurrencyTwd(floorResult.assessedCurrentValueTotal)],
    ["公告現值加權平均單價", formatCurrencyTwdPerSqm(floorResult.assessedCurrentValueWeightedUnit)],
    ["公告現值來源狀態", floorResult.assessedCurrentValueSourceStatus],
    ["使用分區", baseInfo.zoning || "尚未輸入"],
    ["建蔽率", formatPercentValue(floorResult.coverageRate)],
    ["基準容積率", formatPercentValue(floorResult.baseFarRate)],
    ["道路 / 臨路條件", baseInfo.roadAccess || "尚未輸入"],
    ["基地限制", baseInfo.siteRestrictions || "尚未輸入"],
    ["法規限制", baseInfo.legalRestrictions || "尚未輸入"],
  ];
  const capacitySourceItems = [
    ["容積模組總容積率", formatPercentValue(floorResult.totalFloorAreaRatio)],
    ["容積模組總容積量", formatSqmAndPing(floorResult.capacityModuleTotalAreaSqm)],
    ["簡易都更獎勵", formatPercentValue(floorResult.simpleUrbanRenewalBonusRate)],
    ["土管 / 規模獎勵", formatPercentValue(floorResult.landUseBonusRate)],
    ["容積移轉", formatPercentValue(floorResult.tdrRate)],
    ["都市更新獎勵", formatPercentValue(floorResult.urbanRenewalBonusRate)],
    ["危老獎勵", formatPercentValue(floorResult.dangerousOldBuildingBonusRate)],
    ["總容積率", formatPercentValue(floorResult.totalFloorAreaRatio)],
    ["基準容積量", formatSqmAndPing(floorResult.baseCapacityAreaSqm)],
    ["獎勵 / 移轉合計", formatSqmAndPing(floorResult.totalRewardCapacityAreaSqm)],
    ["允建容積面積", formatSqmAndPing(floorResult.allowedCapacityAreaSqm)],
  ];
  const resultItems = [
    ["法定建蔽面積", formatSqmAndPing(floorResult.legalCoverageAreaSqm)],
    ["基準容積量", formatSqmAndPing(floorResult.baseCapacityAreaSqm)],
    ["獎勵容積量", formatSqmAndPing(floorResult.rewardCapacityAreaSqm)],
    ["容積移轉量", formatSqmAndPing(floorResult.tdrCapacityAreaSqm)],
    ["總獎勵 / 移轉容積", formatSqmAndPing(floorResult.totalRewardCapacityAreaSqm)],
    ["免計容積面積", formatSqmAndPing(floorResult.excludedCapacityAreaSqm)],
    ["屋突 / 雨遮 / 外皮", formatSqmAndPing(floorResult.roofAndProjectionAreaSqm)],
    ["地上興建面積", formatSqmAndPing(floorResult.aboveGroundBuildAreaSqm)],
    ["地上樓層推估", Number.isFinite(floorResult.aboveGroundFloors) ? `${floorResult.aboveGroundFloors} 層` : "待補資料"],
    ["地上樓地板面積", formatSqmAndPing(floorResult.aboveGroundFloorAreaSqm)],
    ["地下樓地板面積", formatSqmAndPing(floorResult.basementFloorAreaSqm)],
    ["總樓地板面積", formatSqmAndPing(floorResult.totalFloorAreaSqm)],
  ];
  const salesItems = [
    ["銷售面積", formatSqmAndPing(floorResult.saleableAreaSqm)],
    ["公設面積", formatSqmAndPing(floorResult.publicAreaSqm)],
    ["試算公設比", formatPercentValue(floorResult.calculatedPublicAreaRatio)],
    ["目標公設比", formatPercentValue(floorResult.targetPublicAreaRatio)],
    ["每坪土地可產生建坪", Number.isFinite(floorResult.buildPingPerLandPing) ? `${formatNumber(floorResult.buildPingPerLandPing, 3)} 建坪 / 土地坪` : "待補資料"],
    ["每坪土地可產生可售坪", Number.isFinite(floorResult.saleablePingPerLandPing) ? `${formatNumber(floorResult.saleablePingPerLandPing, 3)} 可售坪 / 土地坪` : "待補資料"],
    ["坪效摘要", Number.isFinite(floorResult.saleablePingPerLandPing) ? `每 1 坪土地約產生 ${formatNumber(floorResult.saleablePingPerLandPing, 3)} 坪可售面積。` : "待補資料"],
    ["計算狀態", floorResult.calculationStatus],
  ];
  const parkingItems = [
    ["地下層數", Number.isFinite(floorResult.undergroundFloors) ? `${formatNumber(floorResult.undergroundFloors, 0)} 層` : "待補資料"],
    ["地下層面積倍數", Number.isFinite(floorResult.basementFloorAreaSqm) ? effectiveParams.basementMultiplier : "待補資料"],
    ["法定汽車位推估", Number.isFinite(floorResult.legalParkingCount) ? `${formatNumber(floorResult.legalParkingCount, 2)} 位` : "待補資料"],
    ["自設汽車位", Number.isFinite(floorResult.selfParkingCount) ? `${formatNumber(floorResult.selfParkingCount, 0)} 位` : "待補資料"],
    ["機車 / 自行車位", Number.isFinite(floorResult.motorcycleParkingCount) && Number.isFinite(floorResult.bikeParkingCount) ? `${formatNumber(floorResult.motorcycleParkingCount, 0)} / ${formatNumber(floorResult.bikeParkingCount, 0)} 位` : "待補資料"],
    ["停車與車道面積", formatSqmAndPing(floorResult.parkingAreaSqm)],
    ["地下層可攤公設面積", formatSqmAndPing(floorResult.sharedPublicAreaSqm)],
  ];

  return (
    <div className="eval-module-stack">
      <CurrentCaseSummary currentCase={currentCase} />
      <ModuleSaveStatusBar saveStatus={saveStatus} onSave={onSaveModule} />
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>來源資料摘要</h4>
          <p>坪效明細承接清冊土地面積、公告現值、基地基本資料與道路 / 法規限制；缺漏處會列入提醒。</p>
        </div>
        <DataSummaryGrid items={sourceItems} />
        <p className="eval-base-summary-note">
          公告現值總額依唯一地號逐筆加總；加權平均單價僅供判讀來源基準。坪效與後續成本模組若需引用公告現值，應使用高精度原始數值，不使用畫面四捨五入後的數字。
        </p>
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>容積與獎勵來源摘要</h4>
          <p>本區承接容積來源與獎勵試算，並依「坪效計算表(1).xlsx」拆出獎勵、免計與可銷售面積計算所需的前端測試參數。</p>
        </div>
        <DataSummaryGrid items={capacitySourceItems} />
      </section>
      <MissingDataNotice missingItems={floorResult.missingItems} />
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>坪效公式參數</h4>
          <p>以下欄位依 Excel 公式模型整理，預設會承接容積模組的容積移轉、都更獎勵、危老獎勵與其他獎勵比例；可依目前案件暫時調整。</p>
        </div>
        <div className="eval-field-grid eval-linked-input-grid">
          {formulaRateFields.map(([field, label, placeholder]) => (
            <label className="eval-field" key={field}>
              <span>{label}</span>
              <input type="text" value={effectiveParams[field]} onChange={handleFloorParamChange(field)} placeholder={placeholder} />
            </label>
          ))}
          {formulaScaleFields.map(([field, label, placeholder]) => (
            <label className="eval-field" key={field}>
              <span>{label}</span>
              <input type="text" value={effectiveParams[field]} onChange={handleFloorParamChange(field)} placeholder={placeholder} />
            </label>
          ))}
          <label className="eval-field eval-field--wide">
            <span>車位 / 附屬面積備註</span>
            <input type="text" value={effectiveParams.parkingNote} onChange={handleFloorParamChange("parkingNote")} placeholder="例：車位數、地下室或附屬面積待建築師確認" />
          </label>
          <label className="eval-field eval-field--wide">
            <span>特殊扣除備註</span>
            <input type="text" value={effectiveParams.deductionNote} onChange={handleFloorParamChange("deductionNote")} placeholder="例：法規扣除、免計容積、不可售面積或特殊限制" />
          </label>
        </div>
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>初步坪效計算結果</h4>
          <p>自動承接土地面積、建蔽率、基準容積率與容積獎勵條件後，先依 Excel 模型呈現前端測試數字。</p>
        </div>
        <DataSummaryGrid items={resultItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>銷售面積與公設摘要</h4>
          <p>銷售面積與公設比先作為成本、銷售情境與權利分配的下游基礎；正式銷售坪轉換方式仍待確認。</p>
        </div>
        <DataSummaryGrid items={salesItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>車位與地下層摘要</h4>
          <p>地下層、法定車位、自設車位與停車面積目前依 Excel 的前端測試假設整理，後續需由建築配置與法規檢核確認。</p>
        </div>
        <DataSummaryGrid items={parkingItems} />
      </section>
      <section className="eval-module-section eval-formula-note">
        <h4>前端測試用坪效初算 / 正式公式待確認</h4>
        <p>目前公式依「坪效計算表(1).xlsx」整理為前端測試模型，正式法規適用、容積獎勵認定、免計容積、車位、雨遮、外皮、公設與銷售坪轉換方式仍待確認。</p>
        <p>主要測試公式：基準容積量 = 土地面積 × 基準容積率；獎勵 / 移轉容積依基準容積量乘各比例；免計容積依允建容積與設備、梯廳、陽台比例推估；地下層面積 = 土地面積 × 地下層面積倍數 × 地下層數；銷售面積 = 允建容積 + 免計 / 屋突 / 地下可攤公設後再乘銷售面積校正比例。1 坪 = 3.305785 平方公尺。</p>
        <p>測試用公式；正式公式待確認。</p>
        <p>下游影響：成本與共同負擔、銷售價格情境與實施方式 / 權利分配會承接可建樓地板面積、預估可售面積與坪效摘要。</p>
      </section>
    </div>
  );
}

const downstreamModuleGuidance = {
  costs: {
    title: "成本與共同負擔將承接前面模組結果",
    description: "此模組未來會承接坪效明細結果、可建樓地板面積、可售面積、公告現值總額、公告現值加權平均單價、開發期程、開發路徑，以及都市更新 / 危老 / 合建等適用成本項目。目前正式成本公式待確認。",
    missing: "待坪效結果與成本參數補齊後，才能形成成本總額與共同負擔摘要。",
  },
  sales: {
    title: "銷售價格情境將承接可售面積與成本",
    description: "此模組未來會承接坪效結果、可售面積、成本總額、當地行情與預估銷售單價，作為分配合理性與損益平衡判斷基礎。目前正式銷售模型待確認。",
    missing: "待坪效與成本結果補齊後，才能形成低 / 中 / 高銷售情境。",
  },
  allocation: {
    title: "實施方式與權利分配將承接權利與財務條件",
    description: "此模組未來會承接土地 / 建物權利資料、坪效結果、成本結果、銷售情境與開發路徑；分配條件不是獨立輸入頁。目前正式分配模型待確認。",
    missing: "待清冊、坪效、成本與銷售結果補齊後，才能進行合理分配判斷。",
  },
  cashflow: {
    title: "現金流與資金需求將承接成本、銷售與期程",
    description: "此模組未來會承接成本結果、銷售回收節點、開發期程、融資需求與利息假設，整理高峰資金缺口。目前正式金流模型待確認。",
    missing: "待成本、銷售與期程假設補齊後，才能形成資金需求摘要。",
  },
  "bank-report": {
    title: "銀行融資報告將彙整全案資料",
    description: "此模組未來會彙整案件基本資料、清冊摘要、基地資料、容積試算、坪效明細、成本與共同負擔、銷售價格情境、分配條件、現金流與資金需求、風險與待補資料。目前正式報告格式待確認。",
    missing: "待前面模組結果補齊後，才能形成銀行融資報告摘要。",
  },
};

function DownstreamModuleNotice({ moduleId, currentCase, capacityResult, floorResult }) {
  const guidance = downstreamModuleGuidance[moduleId];

  if (!guidance) {
    return null;
  }

  const downstreamSaleableAreaSqm = pickNumericValue(floorResult?.saleableAreaSqm, floorResult?.estimatedSaleableAreaSqm);
  const sourceItems = [
    ["目前案件", currentCase ? `${currentCase.code} / ${currentCase.name}` : "尚未選定案件"],
    ["容積試算", Number.isFinite(capacityResult?.totalCapacityAreaSqm) ? `總容積量 ${formatSqmAndPing(capacityResult.totalCapacityAreaSqm)}` : "待容積來源與獎勵試算"],
    ["坪效明細", Number.isFinite(downstreamSaleableAreaSqm) ? `銷售面積 ${formatSqmAndPing(downstreamSaleableAreaSqm)}` : "待坪效明細計算"],
  ];

  return (
    <section className="eval-module-section eval-downstream-notice">
      <div className="eval-section-head">
        <h4>{guidance.title}</h4>
        <p>{guidance.description}</p>
      </div>
      <DataSummaryGrid items={sourceItems} />
      <p>{guidance.missing}</p>
    </section>
  );
}

function RolePermissionPanel({ profile }) {
  return (
    <section className="eval-module-section eval-role-rules">
      <div className="eval-section-head">
        <h4>角色權限顯示規則</h4>
        <p>
          目前以前端 mock role 切換示範 admin / user 的顯示差異。正式上線時，後端 API 與資料庫規則仍必須檢查角色、授權方案與設備綁定，不可只靠前端隱藏。
        </p>
      </div>
      <div className="eval-role-rule-grid">
        {roleVisibilityRules.moduleRules.map((item) => (
          <article key={item.target}>
            <strong>{item.target}</strong>
            <p>{item.rule}</p>
          </article>
        ))}
        {roleVisibilityRules.parameterRules.map((item) => (
          <article key={item.target}>
            <strong>{item.target}</strong>
            <p>{item.rule}</p>
          </article>
        ))}
        <article>
          <strong>目前 mock</strong>
          <p>
            {profile.roleLabel} / {profile.plan}：
            {profile.permissions.adminModules ? "可看管理端模組" : "隱藏管理端模組"}，
            {profile.permissions.takeover ? "可看承接評估" : "隱藏承接評估"}，
            {profile.permissions.bankReport ? "可看銀行報告" : "隱藏銀行報告"}。
          </p>
        </article>
        <article>
          <strong>後端檢查</strong>
          <p>{roleVisibilityRules.backendRequirements.join("；")}。</p>
        </article>
      </div>
    </section>
  );
}

function ParameterAccessNotice({ profile }) {
  return (
    <section className="eval-module-section eval-parameter-access">
      <div className="eval-section-head">
        <h4>參數權限分層</h4>
        <p>案件個別參數與全系統預設參數要分開控管；這裡先以前端 mock role 顯示後續正式權限規則。</p>
      </div>
      <div className="eval-role-rule-grid">
        <article>
          <strong>案件個別參數</strong>
          <p>一般使用者可看可調整，僅影響目前案件試算。</p>
        </article>
        <article className={profile.permissions.systemParameters ? "" : "is-locked"}>
          <strong>全系統預設參數</strong>
          <p>{profile.permissions.systemParameters ? "管理員可看可調整。" : "一般使用者不顯示，需管理員權限。"}</p>
        </article>
      </div>
    </section>
  );
}

function recalculateImportedEvaluationResults({
  cases,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityInputsByCaseId,
  floorEfficiencyParamsByCaseId,
}) {
  const capacityResultsByCaseId = {};
  const floorEfficiencyResultsByCaseId = {};

  cases.forEach((caseItem) => {
    const caseId = caseItem.id;
    const rosterStaging = rosterStagingByCaseId[caseId] ?? null;
    const baseInfo = baseInfoByCaseId[caseId] ?? defaultBaseInfo;
    const capacityInputs = getEffectiveCapacityInputs(
      capacityInputsByCaseId[caseId] ?? defaultCapacityInputs,
      baseInfo,
    );
    const capacityResult = calculateCapacityResult(rosterStaging, baseInfo, capacityInputs);
    const floorParams = getEffectiveFloorEfficiencyParams(
      floorEfficiencyParamsByCaseId[caseId] ?? defaultFloorEfficiencyParams,
      capacityResult,
    );

    capacityResultsByCaseId[caseId] = capacityResult;
    floorEfficiencyResultsByCaseId[caseId] = calculateFloorEfficiencyResult(
      rosterStaging,
      baseInfo,
      capacityResult,
      floorParams,
    );
  });

  return { capacityResultsByCaseId, floorEfficiencyResultsByCaseId };
}

function RosterCaseRequiredNotice({ onGoToCases }) {
  return (
    <section className="eval-module-section eval-case-required">
      <LockKeyhole aria-hidden="true" size={30} />
      <div>
        <p className="eval-kicker">CASE REQUIRED</p>
        <h4>請先建立或選擇案件</h4>
        <p>
          土地清冊與建物清冊必須歸屬於單一案件。請先至「案件管理」建立案件，或從案件列表選擇目前案件後，再進行清冊匯入、版本比對與正式套用。
        </p>
        <button type="button" onClick={onGoToCases}>
          前往案件管理
        </button>
      </div>
    </section>
  );
}

function OwnershipModule({ module, currentCase, rosterStaging, onRosterStagingChange, onGoToCases }) {
  const rosterFileInputRef = useRef(null);
  const handleRosterFileRequest = () => {
    rosterFileInputRef.current?.click();
  };

  if (!currentCase) {
    return (
      <div className="eval-module-stack">
        <RosterCaseRequiredNotice onGoToCases={onGoToCases} />
      </div>
    );
  }

  return (
    <div className="eval-module-stack">
      <CurrentCaseSummary currentCase={currentCase} />
      <RosterUploadTesting
        currentCase={currentCase}
        fileInputRef={rosterFileInputRef}
        onRequestFile={handleRosterFileRequest}
        preview={rosterStaging}
        onPreviewChange={onRosterStagingChange}
      />
      <RosterImportVersioning
        config={module.rosterImportVersioning}
      />
    </div>
  );
}

function ModuleContent({
  module,
  accessProfile,
  cases,
  currentCaseId,
  currentCase,
  currentBaseInfo,
  currentRosterStaging,
  currentCapacityInputs,
  currentCapacityResults,
  currentFloorEfficiencyParams,
  currentFloorEfficiencyResults,
  moduleSaveStatusByCaseId,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityInputsByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyParamsByCaseId,
  floorEfficiencyResultsByCaseId,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onSelectCase,
  onBaseInfoChange,
  onRosterStagingChange,
  onCapacityInputsChange,
  onCapacityResultsChange,
  onFloorEfficiencyParamsChange,
  onFloorEfficiencyResultsChange,
  onMarkModuleUnsaved,
  onSaveModuleData,
  onClearLocalTestData,
  onImportLocalTestData,
  onGoToCases,
}) {
  if (module.type === "paths") {
    return <DevelopmentPathModule />;
  }

  if (module.type === "takeover") {
    return <TakeoverEvaluationModule module={module} />;
  }

  if (module.type === "license") {
    return <LicenseManagementModule module={module} />;
  }

  if (module.type === "security") {
    return <SecurityProtectionModule module={module} />;
  }

  if (module.id === "case-management") {
    return (
      <CaseManagementModule
        accessProfile={accessProfile}
        cases={cases}
        currentCaseId={currentCaseId}
        currentCase={currentCase}
        rosterStagingByCaseId={rosterStagingByCaseId}
        baseInfoByCaseId={baseInfoByCaseId}
        capacityInputsByCaseId={capacityInputsByCaseId}
        capacityResultsByCaseId={capacityResultsByCaseId}
        floorEfficiencyParamsByCaseId={floorEfficiencyParamsByCaseId}
        floorEfficiencyResultsByCaseId={floorEfficiencyResultsByCaseId}
        onAddCase={onAddCase}
        onUpdateCase={onUpdateCase}
        onDeleteCase={onDeleteCase}
        onSelectCase={onSelectCase}
        onClearLocalTestData={onClearLocalTestData}
        onImportLocalTestData={onImportLocalTestData}
      />
    );
  }

  if (module.id === "ownership") {
    return (
      <OwnershipModule
        module={module}
        currentCase={currentCase}
        rosterStaging={currentRosterStaging}
        onRosterStagingChange={onRosterStagingChange}
        onGoToCases={onGoToCases}
      />
    );
  }

  if (module.id === "base-info") {
    return (
      <BaseInfoModule
        currentCase={currentCase}
        baseInfo={currentBaseInfo}
        rosterStaging={currentRosterStaging}
        saveStatus={getCurrentSaveStatus(moduleSaveStatusByCaseId, currentCase?.id, module.id)}
        onBaseInfoChange={onBaseInfoChange}
        onMarkUnsaved={() => onMarkModuleUnsaved(module.id)}
        onSaveModule={() => onSaveModuleData(module.id)}
        onGoToCases={onGoToCases}
      />
    );
  }

  if (module.id === "capacity") {
    return (
      <CapacityModule
        currentCase={currentCase}
        baseInfo={currentBaseInfo}
        rosterStaging={currentRosterStaging}
        capacityInputs={currentCapacityInputs}
        saveStatus={getCurrentSaveStatus(moduleSaveStatusByCaseId, currentCase?.id, module.id)}
        onCapacityInputsChange={onCapacityInputsChange}
        onCapacityResultsChange={onCapacityResultsChange}
        onMarkUnsaved={() => onMarkModuleUnsaved(module.id)}
        onSaveModule={() => onSaveModuleData(module.id)}
        onGoToCases={onGoToCases}
      />
    );
  }

  if (module.id === "efficiency") {
    return (
      <FloorEfficiencyModule
        currentCase={currentCase}
        rosterStaging={currentRosterStaging}
        baseInfo={currentBaseInfo}
        capacityResult={currentCapacityResults}
        floorParams={currentFloorEfficiencyParams}
        saveStatus={getCurrentSaveStatus(moduleSaveStatusByCaseId, currentCase?.id, module.id)}
        onFloorParamsChange={onFloorEfficiencyParamsChange}
        onFloorResultsChange={onFloorEfficiencyResultsChange}
        onMarkUnsaved={() => onMarkModuleUnsaved(module.id)}
        onSaveModule={() => onSaveModuleData(module.id)}
        onGoToCases={onGoToCases}
      />
    );
  }

  return (
    <div className="eval-module-stack">
      {module.id === "parameters" && <ParameterAccessNotice profile={accessProfile} />}
      {["costs", "sales", "allocation", "cashflow", "bank-report"].includes(module.id) && (
        <DownstreamModuleNotice moduleId={module.id} currentCase={currentCase} capacityResult={currentCapacityResults} floorResult={currentFloorEfficiencyResults} />
      )}
      <AssessmentModeCards modes={module.modeOptions} />
      {module.sections.map((section) => (
        module.id === "parameters" && section.access === "admin" && !accessProfile.permissions.systemParameters ? null : (
          <ModuleSection section={section} key={section.title} />
        )
      ))}
    </div>
  );
}

function EvaluationLanding({ onLogin }) {
  return (
    <main className="evaluation-shell evaluation-shell--landing">
      <header className="eval-public-header">
        <a className="eval-back-link" href="#top">
          <ArrowLeft aria-hidden="true" size={18} />
          回到三策官網
        </a>
        <span>第一階段 UI 骨架</span>
      </header>

      <section className="eval-landing">
        <div className="eval-landing__copy">
          <p className="eval-kicker">SANZE PRO SYSTEM</p>
          <h1>開發評估系統</h1>
          <p>
            協助進行購地自建、一般合建、危老重建、都市更新與自主更新案件的前期開發可行性評估，先把基地條件、容積來源、坪效、成本、銷售情境、分配、現金流與銀行融資報告建立成可延伸的資料骨架。
          </p>
          <div className="eval-landing__actions">
            <button type="button" onClick={onLogin}>
              進入示範系統
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            <a href="#system-modules">了解系統模組</a>
          </div>
        </div>

        <aside className="eval-login-card" aria-label="登入提示">
          <LockKeyhole aria-hidden="true" size={34} />
          <h2>登入提示</h2>
          <p>目前尚未串接正式帳號後端。第一階段先使用前端 mock 登入狀態，讓系統主畫面、模組導覽與欄位骨架可以先被檢視。</p>
          <button type="button" onClick={onLogin}>
            使用 mock 身分登入
          </button>
        </aside>
      </section>

      <section className="eval-module-preview" id="system-modules">
        <div className="eval-section-title">
          <p className="eval-kicker">MODULES</p>
          <h2>第一階段主模組</h2>
        </div>
        <div className="eval-preview-grid">
          {evaluationModules.map((module) => (
            <article key={module.id}>
              <span>{module.eyebrow}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function DashboardHome({ activeModule, cases, currentCase, visibleModuleCount }) {
  return (
    <section className="eval-dashboard-home" aria-label="系統總覽">
      <div className="eval-overview-grid">
        <article>
          <span>案件列表</span>
          <strong>{cases.length}</strong>
          <p>本機測試建立的案件數，正式版將由 cases 資料表提供。</p>
        </article>
        <article>
          <span>開發路徑</span>
          <strong>5</strong>
          <p>購地自建、合建、危老、都更、自主更新。</p>
        </article>
        <article>
          <span>主模組</span>
          <strong>{visibleModuleCount}</strong>
          <p>依目前 mock role 與授權方案顯示。</p>
        </article>
      </div>

      <div className="eval-case-panel">
        <div className="eval-section-title">
          <p className="eval-kicker">CASES</p>
          <h2>案件管理概覽</h2>
        </div>
        <div className="eval-case-list">
          {cases.length ? (
            cases.slice(0, 3).map((item) => (
              <article key={item.id} className={currentCase?.id === item.id ? "is-current-case" : ""}>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.path} / {item.status}
                  </p>
                </div>
                <span>{item.updated}</span>
              </article>
            ))
          ) : (
            <p className="eval-empty-state">目前尚無案件，請先建立案件。</p>
          )}
        </div>
      </div>

      <div className="eval-context-strip">
        <div className="eval-current-module">
          <CheckCircle2 aria-hidden="true" size={18} />
          目前案件：{currentCase?.name ?? "尚未選定案件"}
        </div>
        <div className="eval-current-module">
          <CheckCircle2 aria-hidden="true" size={18} />
          目前模組：{activeModule.title}
        </div>
      </div>
    </section>
  );
}

function EvaluationLogin({ errorMessage, isChecking, isSubmitting, onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <main className="evaluation-shell evaluation-shell--landing">
      <header className="eval-public-header">
        <a className="eval-back-link" href="#top">
          <ArrowLeft aria-hidden="true" size={18} />
          回到三策官網
        </a>
        <span>指定管理者測試入口</span>
      </header>

      <section className="eval-landing eval-landing--auth">
        <div className="eval-landing__copy">
          <p className="eval-kicker">SANZE SYSTEM TEST</p>
          <h1>開發評估系統</h1>
          <p>
            本系統目前為三策內部授權測試，未開放公開使用。指定管理者可使用核發的 email 與測試密碼登入，正式販售前仍需接入正式 Auth、帳號授權資料庫、單一設備綁定、session 紀錄、audit log、API 權限驗證、customer data isolation 與 RLS 或後端權限檢查。
          </p>
        </div>

        <aside className="eval-login-card" aria-label="三策管理者測試登入">
          <LockKeyhole aria-hidden="true" size={34} />
          <h2>管理者測試登入</h2>
          <p>密碼不會寫在前端程式碼中；測試帳號、密碼雜湊、salt 與 session secret 需在 Vercel Environment Variables 設定。</p>
          <form className="eval-auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input
                autoComplete="username"
                inputMode="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                type="email"
                value={email}
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="請輸入測試密碼"
                type="password"
                value={password}
                required
              />
            </label>
            {errorMessage && <p className="eval-auth-error">{errorMessage}</p>}
            <button type="submit" disabled={isChecking || isSubmitting}>
              {isSubmitting ? "登入中..." : "登入測試系統"}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

function EvaluationAccessClosed({ isChecking }) {
  return (
    <main className="evaluation-shell evaluation-shell--landing">
      <header className="eval-public-header">
        <a className="eval-back-link" href="#top">
          <ArrowLeft aria-hidden="true" size={18} />
          回到三策官網
        </a>
        <span>系統暫不公開</span>
      </header>
      <section className="eval-access-closed">
        <LockKeyhole aria-hidden="true" size={42} />
        <p className="eval-kicker">PRIVATE TEST</p>
        <h1>開發評估系統暫不公開</h1>
        {isChecking && <span>正在確認測試 session...</span>}
      </section>
    </main>
  );
}

export function EvaluationSystem({ routeHash = window.location.hash }) {
  const [authState, setAuthState] = useState({ status: "checking", email: "", role: "" });
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockRole, setMockRole] = useState("admin");
  const [activeModuleId, setActiveModuleId] = useState(evaluationModules[0].id);
  const [cases, setCases] = useState(loadStoredCases);
  const [currentCaseId, setCurrentCaseId] = useState(loadStoredCurrentCaseId);
  const [rosterStagingByCaseId, setRosterStagingByCaseId] = useState(() => loadStoredRecord(ROSTER_STAGING_STORAGE_KEY));
  const [baseInfoByCaseId, setBaseInfoByCaseId] = useState(() => loadStoredRecord(BASE_INFO_STORAGE_KEY));
  const [capacityInputsByCaseId, setCapacityInputsByCaseId] = useState(() => loadStoredRecord(CAPACITY_INPUTS_STORAGE_KEY));
  const [capacityResultsByCaseId, setCapacityResultsByCaseId] = useState(() => loadStoredRecord(CAPACITY_RESULTS_STORAGE_KEY));
  const [floorEfficiencyParamsByCaseId, setFloorEfficiencyParamsByCaseId] = useState(() => loadStoredRecord(FLOOR_EFFICIENCY_PARAMS_STORAGE_KEY));
  const [floorEfficiencyResultsByCaseId, setFloorEfficiencyResultsByCaseId] = useState(() => loadStoredRecord(FLOOR_EFFICIENCY_RESULTS_STORAGE_KEY));
  const [moduleSaveStatusByCaseId, setModuleSaveStatusByCaseId] = useState({});
  const isLoggedIn = authState.status === "authenticated";
  const isTestRoute = routeHash === SYSTEM_TEST_HASH;
  const accessProfile = mockAccessProfiles[mockRole];
  const currentCase = useMemo(
    () => cases.find((item) => item.id === currentCaseId) ?? null,
    [cases, currentCaseId],
  );
  const currentRosterStaging = currentCase ? rosterStagingByCaseId[currentCase.id] ?? null : null;
  const currentBaseInfo = currentCase ? baseInfoByCaseId[currentCase.id] ?? defaultBaseInfo : defaultBaseInfo;
  const currentCapacityInputs = currentCase ? capacityInputsByCaseId[currentCase.id] ?? defaultCapacityInputs : defaultCapacityInputs;
  const currentCapacityResults = currentCase ? capacityResultsByCaseId[currentCase.id] ?? null : null;
  const currentFloorEfficiencyParams = currentCase ? floorEfficiencyParamsByCaseId[currentCase.id] ?? defaultFloorEfficiencyParams : defaultFloorEfficiencyParams;
  const currentFloorEfficiencyResults = currentCase ? floorEfficiencyResultsByCaseId[currentCase.id] ?? null : null;
  const visiblePrimaryModules = useMemo(
    () => primaryEvaluationModules.filter((module) => canViewModule(module, accessProfile)),
    [accessProfile],
  );
  const visibleTakeoverModule = takeoverEvaluationModule && canViewModule(takeoverEvaluationModule, accessProfile)
    ? takeoverEvaluationModule
    : null;
  const visibleModules = useMemo(
    () => (visibleTakeoverModule ? [...visiblePrimaryModules, visibleTakeoverModule] : visiblePrimaryModules),
    [visiblePrimaryModules, visibleTakeoverModule],
  );
  const activeModule = useMemo(
    () => visibleModules.find((module) => module.id === activeModuleId) ?? visibleModules[0] ?? evaluationModules[0],
    [activeModuleId, visibleModules],
  );

  useEffect(() => {
    if (!visibleModules.some((module) => module.id === activeModuleId) && visibleModules[0]) {
      setActiveModuleId(visibleModules[0].id);
    }
  }, [activeModuleId, visibleModules]);

  useEffect(() => {
    writeStoredJson(CASES_STORAGE_KEY, cases);
  }, [cases]);

  useEffect(() => {
    writeStoredJson(ROSTER_STAGING_STORAGE_KEY, rosterStagingByCaseId);
  }, [rosterStagingByCaseId]);

  useEffect(() => {
    writeStoredJson(BASE_INFO_STORAGE_KEY, baseInfoByCaseId);
  }, [baseInfoByCaseId]);

  useEffect(() => {
    writeStoredJson(CAPACITY_INPUTS_STORAGE_KEY, capacityInputsByCaseId);
  }, [capacityInputsByCaseId]);

  useEffect(() => {
    writeStoredJson(CAPACITY_RESULTS_STORAGE_KEY, capacityResultsByCaseId);
  }, [capacityResultsByCaseId]);

  useEffect(() => {
    writeStoredJson(FLOOR_EFFICIENCY_PARAMS_STORAGE_KEY, floorEfficiencyParamsByCaseId);
  }, [floorEfficiencyParamsByCaseId]);

  useEffect(() => {
    writeStoredJson(FLOOR_EFFICIENCY_RESULTS_STORAGE_KEY, floorEfficiencyResultsByCaseId);
  }, [floorEfficiencyResultsByCaseId]);

  useEffect(() => {
    const resolvedCurrentCaseId = resolveImportedCurrentCaseId(cases, currentCaseId);
    if (resolvedCurrentCaseId !== currentCaseId) {
      setCurrentCaseId(resolvedCurrentCaseId);
    }
  }, [cases, currentCaseId]);

  useEffect(() => {
    const resolvedCurrentCaseId = resolveImportedCurrentCaseId(cases, currentCaseId);
    if (resolvedCurrentCaseId) {
      writeStoredString(CURRENT_CASE_ID_STORAGE_KEY, resolvedCurrentCaseId);
    } else {
      removeStoredJson(CURRENT_CASE_ID_STORAGE_KEY);
    }
  }, [cases, currentCaseId]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/sanze-system-session", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (data.authenticated) {
          setAuthState({ status: "authenticated", email: data.email ?? "", role: data.role ?? "admin" });
          setMockRole("admin");
        } else {
          setAuthState({ status: "unauthenticated", email: "", role: "" });
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthState({ status: "unauthenticated", email: "", role: "" });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async ({ email, password }) => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const response = await fetch("/api/sanze-system-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.authenticated) {
        setLoginError("帳號或密碼不正確，或尚未取得授權。");
        setAuthState({ status: "unauthenticated", email: "", role: "" });
        return;
      }

      setAuthState({ status: "authenticated", email: data.email ?? email, role: data.role ?? "admin" });
      setMockRole("admin");
    } catch {
      setLoginError("帳號或密碼不正確，或尚未取得授權。");
      setAuthState({ status: "unauthenticated", email: "", role: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/sanze-system-logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setAuthState({ status: "unauthenticated", email: "", role: "" });
    setMockRole("admin");
    removeStoredJson(CURRENT_CASE_ID_STORAGE_KEY);
    setCurrentCaseId("");
  };

  const handleAddCase = (createdCase) => {
    setCases((current) => [...current, createdCase]);
    setCurrentCaseId((current) => current || createdCase.id);
  };

  const handleUpdateCase = (updatedCase) => {
    setCases((current) => current.map((item) => (item.id === updatedCase.id ? updatedCase : item)));
  };

  const handleDeleteCase = (caseId) => {
    setCases((current) => current.filter((item) => item.id !== caseId));
    setRosterStagingByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setBaseInfoByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setCapacityInputsByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setCapacityResultsByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setFloorEfficiencyParamsByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setFloorEfficiencyResultsByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setModuleSaveStatusByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    if (currentCaseId === caseId) {
      removeStoredJson(CURRENT_CASE_ID_STORAGE_KEY);
      setCurrentCaseId("");
    }
  };

  const handleSelectCase = (caseId) => {
    if (cases.some((item) => item.id === caseId)) {
      writeStoredString(CURRENT_CASE_ID_STORAGE_KEY, caseId);
      setCurrentCaseId(caseId);
    } else {
      removeStoredJson(CURRENT_CASE_ID_STORAGE_KEY);
      setCurrentCaseId("");
    }
  };

  const handleMarkModuleUnsaved = (moduleId) => {
    if (!currentCase) {
      return;
    }

    setModuleSaveStatusByCaseId((current) => ({
      ...current,
      [currentCase.id]: {
        ...(current[currentCase.id] ?? {}),
        [moduleId]: {
          ...getCurrentSaveStatus(current, currentCase.id, moduleId),
          state: "dirty",
        },
      },
    }));
  };

  const handleSaveModuleData = (moduleId) => {
    if (!currentCase) {
      return;
    }

    setModuleSaveStatusByCaseId((current) => ({
      ...current,
      [currentCase.id]: {
        ...(current[currentCase.id] ?? {}),
        [moduleId]: {
          state: "saved",
          savedAt: new Date().toLocaleString("zh-TW", { hour12: false }),
        },
      },
    }));
  };

  const handleRosterStagingChange = (preview) => {
    if (!currentCase) {
      return;
    }

    setRosterStagingByCaseId((current) => {
      const next = { ...current };
      if (preview) {
        next[currentCase.id] = preview;
      } else {
        delete next[currentCase.id];
      }
      return next;
    });
  };

  const handleBaseInfoChange = (nextBaseInfo) => {
    if (!currentCase) {
      return;
    }

    setBaseInfoByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextBaseInfo,
    }));
  };

  const handleCapacityInputsChange = (nextCapacityInputs) => {
    if (!currentCase) {
      return;
    }

    setCapacityInputsByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextCapacityInputs,
    }));
  };

  const handleCapacityResultsChange = (nextCapacityResults) => {
    if (!currentCase) {
      return;
    }

    setCapacityResultsByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextCapacityResults,
    }));
  };

  const handleFloorEfficiencyParamsChange = (nextFloorEfficiencyParams) => {
    if (!currentCase) {
      return;
    }

    setFloorEfficiencyParamsByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextFloorEfficiencyParams,
    }));
  };

  const handleFloorEfficiencyResultsChange = (nextFloorEfficiencyResults) => {
    if (!currentCase) {
      return;
    }

    setFloorEfficiencyResultsByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextFloorEfficiencyResults,
    }));
  };

  const handleClearLocalTestData = () => {
    clearStoredEvaluationData();
    setCases([]);
    setCurrentCaseId("");
    setRosterStagingByCaseId({});
    setBaseInfoByCaseId({});
    setCapacityInputsByCaseId({});
    setCapacityResultsByCaseId({});
    setFloorEfficiencyParamsByCaseId({});
    setFloorEfficiencyResultsByCaseId({});
    setModuleSaveStatusByCaseId({});
  };

  const handleImportLocalTestData = (importedData) => {
    const importedCases = Array.isArray(importedData?.cases) ? importedData.cases : [];
    const importedRosterStaging = isPlainRecord(importedData?.rosterStagingByCaseId)
      ? importedData.rosterStagingByCaseId
      : {};
    const importedBaseInfo = isPlainRecord(importedData?.baseInfoByCaseId)
      ? importedData.baseInfoByCaseId
      : {};
    const importedCapacityInputs = isPlainRecord(importedData?.capacityInputsByCaseId)
      ? importedData.capacityInputsByCaseId
      : {};
    const importedFloorEfficiencyParams = isPlainRecord(importedData?.floorEfficiencyParamsByCaseId)
      ? importedData.floorEfficiencyParamsByCaseId
      : {};
    const {
      capacityResultsByCaseId: recalculatedCapacityResults,
      floorEfficiencyResultsByCaseId: recalculatedFloorEfficiencyResults,
    } = recalculateImportedEvaluationResults({
      cases: importedCases,
      rosterStagingByCaseId: importedRosterStaging,
      baseInfoByCaseId: importedBaseInfo,
      capacityInputsByCaseId: importedCapacityInputs,
      floorEfficiencyParamsByCaseId: importedFloorEfficiencyParams,
    });
    const importedCurrentCaseId = typeof importedData?.currentCaseId === "string" ? importedData.currentCaseId : "";
    const nextCurrentCaseId = resolveImportedCurrentCaseId(importedCases, importedCurrentCaseId);

    writeStoredJson(CASES_STORAGE_KEY, importedCases);
    if (nextCurrentCaseId) {
      writeStoredString(CURRENT_CASE_ID_STORAGE_KEY, nextCurrentCaseId);
    } else {
      removeStoredJson(CURRENT_CASE_ID_STORAGE_KEY);
    }
    writeStoredJson(ROSTER_STAGING_STORAGE_KEY, importedRosterStaging);
    writeStoredJson(BASE_INFO_STORAGE_KEY, importedBaseInfo);
    writeStoredJson(CAPACITY_INPUTS_STORAGE_KEY, importedCapacityInputs);
    writeStoredJson(CAPACITY_RESULTS_STORAGE_KEY, recalculatedCapacityResults);
    writeStoredJson(FLOOR_EFFICIENCY_PARAMS_STORAGE_KEY, importedFloorEfficiencyParams);
    writeStoredJson(FLOOR_EFFICIENCY_RESULTS_STORAGE_KEY, recalculatedFloorEfficiencyResults);
    LOCAL_TEST_DATA_RECORD_FIELDS
      .filter(({ dataKey }) => ![
        "capacityInputsByCaseId",
        "capacityResultsByCaseId",
        "floorEfficiencyParamsByCaseId",
        "floorEfficiencyResultsByCaseId",
      ].includes(dataKey))
      .forEach(({ dataKey, storageKey }) => {
        writeStoredJson(storageKey, isPlainRecord(importedData?.[dataKey]) ? importedData[dataKey] : {});
      });
    setCases(importedCases);
    setCurrentCaseId(nextCurrentCaseId);
    setRosterStagingByCaseId(importedRosterStaging);
    setBaseInfoByCaseId(importedBaseInfo);
    setCapacityInputsByCaseId(importedCapacityInputs);
    setCapacityResultsByCaseId(recalculatedCapacityResults);
    setFloorEfficiencyParamsByCaseId(importedFloorEfficiencyParams);
    setFloorEfficiencyResultsByCaseId(recalculatedFloorEfficiencyResults);
    setModuleSaveStatusByCaseId({});
  };

  const handleGoToCases = () => {
    setActiveModuleId("case-management");
  };

  if (!isLoggedIn) {
    if (!isTestRoute) {
      return <EvaluationAccessClosed isChecking={authState.status === "checking"} />;
    }

    return (
      <EvaluationLogin
        errorMessage={loginError}
        isChecking={authState.status === "checking"}
        isSubmitting={isSubmitting}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <main className="evaluation-shell evaluation-shell--app">
      <aside className="eval-sidebar">
        <a className="eval-back-link eval-back-link--dark" href="#top">
          <ArrowLeft aria-hidden="true" size={18} />
          回官網
        </a>
        <div className="eval-sidebar__brand">
          <LayoutDashboard aria-hidden="true" size={28} />
          <div>
            <p>開發評估系統</p>
            <span>Sanze PM Consulting</span>
          </div>
        </div>

        <nav className="eval-module-nav" aria-label="開發評估系統主流程模組導覽">
          {visiblePrimaryModules.map((module) => (
            <button
              className={module.id === activeModuleId ? "is-active" : ""}
              type="button"
              key={module.id}
              data-module-id={module.id}
              onClick={() => setActiveModuleId(module.id)}
            >
              <span>{module.eyebrow}</span>
              {module.shortTitle ?? module.title}
            </button>
          ))}
        </nav>

        {visibleTakeoverModule && (
          <div className="eval-sidebar__takeover" aria-label="獨立評估入口">
            <button
              className={`eval-takeover-entry${
                visibleTakeoverModule.id === activeModuleId ? " is-active" : ""
              }`}
              type="button"
              data-module-id={visibleTakeoverModule.id}
              onClick={() => setActiveModuleId(visibleTakeoverModule.id)}
            >
              <span className="eval-takeover-entry__badge">{visibleTakeoverModule.eyebrow}</span>
              <strong>{visibleTakeoverModule.shortTitle ?? visibleTakeoverModule.title}</strong>
              <small>進行中案件 / 既有條件反推</small>
            </button>
          </div>
        )}
      </aside>

      <section className="eval-workspace">
        <header className="eval-workspace__top">
          <div>
            <p className="eval-kicker">AUTHORIZED TEST</p>
            <h1>開發評估系統</h1>
          </div>
          <div className="eval-user-status">
            <span>{authState.email || accessProfile.label}</span>
            <div className="eval-role-switch" aria-label="mock role 切換">
              {Object.entries(mockAccessProfiles).map(([role, profile]) => (
                <button
                  className={mockRole === role ? "is-active" : ""}
                  type="button"
                  key={role}
                  onClick={() => setMockRole(role)}
                >
                  {profile.roleLabel}
                </button>
              ))}
            </div>
            <button type="button" onClick={handleLogout}>
              登出
            </button>
          </div>
        </header>

        <DashboardHome
          activeModule={activeModule}
          cases={cases}
          currentCase={currentCase}
          visibleModuleCount={visibleModules.length}
        />

        <section className="eval-module-panel" data-active-module={activeModule.id}>
          <div className="eval-module-panel__head">
            <div>
              <p className="eval-kicker">{activeModule.eyebrow}</p>
              <h2>{activeModule.title}</h2>
              <p>{activeModule.description}</p>
            </div>
            <div className="eval-panel-icons" aria-hidden="true">
              <Building2 size={18} />
              <BarChart3 size={18} />
              <FileText size={18} />
              <Settings2 size={18} />
            </div>
          </div>
          <WorkflowStageStrip activeModuleId={activeModule.id} />
          <ModuleFlowBrief module={activeModule} />
          <ModuleContent
            module={activeModule}
            accessProfile={accessProfile}
            cases={cases}
            currentCaseId={currentCaseId}
            currentCase={currentCase}
            currentBaseInfo={currentBaseInfo}
            currentRosterStaging={currentRosterStaging}
            currentCapacityInputs={currentCapacityInputs}
            currentCapacityResults={currentCapacityResults}
            currentFloorEfficiencyParams={currentFloorEfficiencyParams}
            currentFloorEfficiencyResults={currentFloorEfficiencyResults}
            rosterStagingByCaseId={rosterStagingByCaseId}
            baseInfoByCaseId={baseInfoByCaseId}
            capacityInputsByCaseId={capacityInputsByCaseId}
            capacityResultsByCaseId={capacityResultsByCaseId}
            floorEfficiencyParamsByCaseId={floorEfficiencyParamsByCaseId}
            floorEfficiencyResultsByCaseId={floorEfficiencyResultsByCaseId}
            moduleSaveStatusByCaseId={moduleSaveStatusByCaseId}
            onAddCase={handleAddCase}
            onUpdateCase={handleUpdateCase}
            onDeleteCase={handleDeleteCase}
            onSelectCase={handleSelectCase}
            onBaseInfoChange={handleBaseInfoChange}
            onRosterStagingChange={handleRosterStagingChange}
            onCapacityInputsChange={handleCapacityInputsChange}
            onCapacityResultsChange={handleCapacityResultsChange}
            onFloorEfficiencyParamsChange={handleFloorEfficiencyParamsChange}
            onFloorEfficiencyResultsChange={handleFloorEfficiencyResultsChange}
            onMarkModuleUnsaved={handleMarkModuleUnsaved}
            onSaveModuleData={handleSaveModuleData}
            onClearLocalTestData={handleClearLocalTestData}
            onImportLocalTestData={handleImportLocalTestData}
            onGoToCases={handleGoToCases}
          />
        </section>
      </section>
    </main>
  );
}
