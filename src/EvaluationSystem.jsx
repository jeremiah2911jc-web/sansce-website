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
import { checkSupabaseConnection } from "./supabaseClient.js";
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
import {
  buildAssessedCurrentValueSummaryFromLandRows,
  buildLandIdentity,
  buildLotIdentityKey,
  buildUniqueLandRows,
  getLandDisplayLabel,
  normalizeLandKeyPart,
} from "./landIdentity.js";
import {
  buildRosterWorkbookMappingResult,
  getMissingRosterRequiredFields,
  getRosterColumnFieldGroups,
  getRosterColumnFieldList,
  getRosterColumnRequiredFieldIds,
  selectRosterSheets,
} from "./rosterColumnMapping.js";
import {
  buildShareAreaQualitySummary,
  evaluateLandShareArea,
} from "./rosterShareAreaValidation.js";
import {
  BUILDING_PREVIEW_COLUMNS,
  LAND_PREVIEW_COLUMNS,
  ROSTER_STANDARD_SCHEMA_VERSION,
} from "./rosterStandardSchema.js";
import {
  createBlankRosterTemplateWorkbookBlob,
  createRosterWorkbookBlob,
} from "./rosterXlsxExporter.js";

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
    note: caseForm.note.trim() || "初始建立",
  };
}

const TAKEOVER_MODULE_ID = "takeover-evaluation";
const ADMIN_ONLY_MODULE_IDS = new Set(["license-management", "security-protection"]);
const LICENSE_GATED_MODULES = {
  "bank-report": "bankReport",
  [TAKEOVER_MODULE_ID]: "takeover",
};
const DOWNSTREAM_PLACEHOLDER_MODULE_IDS = new Set(["sales", "allocation", "cashflow", "bank-report"]);
const SYSTEM_TEST_HASH = "#system-test";
const SYSTEM_AUTH_REQUEST_TIMEOUT_MS = 15000;
const LOCAL_SYSTEM_AUTH_UNAVAILABLE_MESSAGE = "本機登入服務沒有回應。請確認是否已啟動本機 API，或改用正式測試站登入。";
const SYSTEM_AUTH_FAILED_MESSAGE = "帳號或密碼不正確，或尚未取得授權。";
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
const UNKNOWN_BUILD_COMMIT = "unknown-build-commit";
const EVALUATION_SYSTEM_EXPORT_FORMAT_VERSION = "evaluation-json-v2";
const EVALUATION_SYSTEM_BASE_COMMIT = "41c88d676fce9922847cc845354639f3a81734c1";
const EVALUATION_SYSTEM_EXPORT_FEATURE_VERSION = "evaluation-json-v2";
const EVALUATION_SYSTEM_BUILD_LABEL = "browser-pdf-parser-and-roster-reimport";
const EVALUATION_SYSTEM_BUILD_COMMIT = normalizeBuildCommit(
  typeof __SANZE_BUILD_COMMIT__ === "undefined" ? "" : __SANZE_BUILD_COMMIT__,
);
const EVALUATION_SYSTEM_BUILD_COMMIT_SOURCE =
  EVALUATION_SYSTEM_BUILD_COMMIT === UNKNOWN_BUILD_COMMIT
    ? "fallback-unknown"
    : normalizeBuildCommitSource(
        typeof __SANZE_BUILD_COMMIT_SOURCE__ === "undefined" ? "" : __SANZE_BUILD_COMMIT_SOURCE__,
      );
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
const DATABASE_SYNCED_RECORD_KEYS = new Set([
  "capacityInputsByCaseId",
  "capacityResultsByCaseId",
  "floorEfficiencyParamsByCaseId",
  "floorEfficiencyResultsByCaseId",
  "costInputsByCaseId",
  "costResultsByCaseId",
]);
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

const demolitionStructureOptions = [
  ["steel", "鋼骨造"],
  ["src", "鋼骨鋼筋混凝土造"],
  ["rc", "鋼筋混凝土造"],
  ["reinforcedBrick", "加強磚造"],
  ["brick", "磚造"],
  ["wood", "竹、木造"],
  ["rubble", "漿砌卵石"],
  ["metalShed", "金屬或鋼鐵棚架"],
  ["other", "其他材料構造物"],
];

const demolitionUnitPriceCaps = {
  steel: 1720,
  src: 1400,
  rc: 1050,
  reinforcedBrick: 900,
  brick: 620,
  wood: 230,
  rubble: 200,
  metalShed: 350,
};

const costCommonGroups = [
  { id: "A", title: "工程費用", subtitle: "拆除、設計、營建、公共設施與其他必要工程費。" },
  { id: "B", title: "容積獎勵後續管理維護相關經費", subtitle: "依事業計畫審定金額與委辦資料提列。" },
  { id: "C", title: "權利變換費用", subtitle: "規劃、估價、鑑界、鑽探、安置、測量與地籍整理等費用。" },
  { id: "D", title: "貸款利息", subtitle: "依新北市公式拆分補償/負擔項目與工程權變項目。" },
  { id: "E", title: "稅捐", subtitle: "印花稅、營業稅與相關函釋計算欄位。" },
  { id: "F", title: "管理費用", subtitle: "行政作業、信託、人事行政、銷售管理與風險管理費。" },
  { id: "G", title: "都市計畫變更負擔費用", subtitle: "依法令變更都市計畫所需捐贈、負擔或委辦費。" },
  { id: "H", title: "容積移轉費用", subtitle: "容積購入費用、委辦費、捐贈公設地或折繳代金方式。" },
];

const costCommonItemDefinitions = [
  {
    id: "a1Demolition",
    groupId: "A",
    code: "A-1",
    title: "拆除費用",
    description: "僅更新前範圍內未提列合法建築物拆遷補償費且屬無主建築物，始得提列。",
    mode: "quantityUnit",
    quantityLabel: "拆除面積（㎡）",
    unitPriceLabel: "拆除單價（元 / ㎡）",
    defaultUnitPrice: "1050",
    selectField: "structureType",
    selectLabel: "構造類別",
    selectOptions: demolitionStructureOptions,
    defaultSelectValue: "rc",
    formula: "拆除費用 = 拆除面積 × 拆除單價",
    basis: "鋼骨造 1,720、SRC 1,400、RC 1,050、加強磚造 900、磚造 620、竹木造 230、漿砌卵石 200、金屬棚架 350 元 / ㎡；其他材料核實計算。",
    evidence: "拆除面積資料、構造證明；其他材料須檢附報價單。",
  },
  {
    id: "a2ArchitectureDesign",
    groupId: "A",
    code: "A-2",
    title: "建築設計費用",
    description: "依新北市工程造價標準表與建築師公會酬金標準表計算。",
    mode: "manual",
    formula: "依公會酬金標準及審議認列",
    basis: "特殊必要設計費用得提列，但須審議同意並檢附合約佐證。",
    evidence: "建築師合約、酬金標準計算表、審議同意資料。",
    reviewRequired: true,
  },
  {
    id: "a3Construction",
    groupId: "A",
    code: "A-3",
    title: "營建費用",
    description: "依構造、樓層、總樓地板面積級距、建材設備表判斷。",
    mode: "quantityUnit",
    quantityLabel: "總樓地板面積（㎡）",
    unitPriceLabel: "營建單價（元 / ㎡）",
    quantitySource: "totalFloorAreaSqm",
    formula: "營建費用 = 總樓地板面積 × 營建單價",
    basis: "營建單價上限依新北市分項說明二營建單價基準；正式單價需依構造、樓層、總樓地板面積與物價指數確認。",
    evidence: "總樓地板面積、建材設備表、營建單價基準、特殊工程佐證。",
    temporary: true,
  },
  {
    id: "a4ConstructionManagement",
    groupId: "A",
    code: "A-4",
    title: "工程管理費",
    description: "原則以自組更新會或非以更新後房地折價抵付之代執行機構者始得提列。",
    mode: "manual",
    formula: "依實際狀況認列",
    basis: "須檢具契約影本佐證。",
    evidence: "工程管理契約影本。",
    reviewRequired: true,
  },
  {
    id: "a5AirPollution",
    groupId: "A",
    code: "A-5",
    title: "空氣污染防制費",
    description: "依空氣污染防制費收費辦法核計。",
    mode: "manual",
    formula: "依收費辦法核計",
    basis: "依主管機關核定金額。",
    evidence: "空污費核計資料或繳費文件。",
  },
  {
    id: "a6ExternalUtilities",
    groupId: "A",
    code: "A-6",
    title: "外接水、電、瓦斯管線工程費用",
    description: "其他特殊情形得視個案提列，需審議通過或檢具事業機構證明。",
    mode: "quantityUnit",
    quantityLabel: "更新後戶數",
    unitPriceLabel: "單價（元 / 戶）",
    defaultUnitPrice: "75000",
    capUnitPrice: 75000,
    formula: "外接水電瓦斯費 = 更新後戶數 × 75,000 元 / 戶",
    basis: "新北市上限 75,000 元 / 戶。",
    evidence: "戶數資料、管線事業機構證明、特殊情形審議資料。",
  },
  {
    id: "a7PublicRoad",
    groupId: "A",
    code: "A-7",
    title: "公共設施工程開闢費用 - 計畫道路",
    description: "公共設施用地、公益設施裝修與認養經費依管理機關審定。",
    mode: "quantityUnit",
    quantityLabel: "開闢面積（㎡）",
    unitPriceLabel: "開闢單價（元 / ㎡）",
    defaultUnitPrice: "4000",
    capUnitPrice: 4000,
    formula: "計畫道路開闢費 = 開闢面積 × 開闢單價",
    basis: "計畫道路不得超過 4,000 元 / ㎡；其他公共設施用地依各管理機關審定金額為準。",
    evidence: "公共設施管理機關審定資料、開闢面積圖說。",
  },
  {
    id: "a7PublicFacilityDonation",
    groupId: "A",
    code: "A-7b",
    title: "公共設施用地捐贈本市土地成本 / 公益設施",
    description: "更新單元外得列入共同負擔；更新單元內不得提列。",
    mode: "manual",
    formula: "依都市更新建築容積獎勵辦法第八條規定成本或管理機關審定金額",
    basis: "公益設施室內裝修 / 認養經費依公益設施管理機關審定金額認列。",
    evidence: "捐贈契約、管理機關審定文件、位置與範圍證明。",
    reviewRequired: true,
  },
  {
    id: "b1BonusMaintenance",
    groupId: "B",
    code: "B",
    title: "容積獎勵後續管理維護相關經費",
    description: "保留項目名稱、審定金額、佐證文件與備註。",
    mode: "manual",
    formula: "依事業計畫所審定金額",
    basis: "依事業計畫所審定金額為準。",
    evidence: "事業計畫審定資料、委辦契約。",
  },
  {
    id: "c1UrbanPlanning",
    groupId: "C",
    code: "C-1",
    title: "都市更新規劃費用",
    description: "P1 事業概要 150 萬，P2 報核 300 萬 + X + Y，P3 成果報核 150 萬。",
    mode: "planningFee",
    formula: "都市更新規劃費 = P1 + P2 + P3 + 其他項目",
    basis: "X 更新面積規模、Y 權利人人數採累計方式；各項費用有 20% 調整彈性，加計費用不得與其他共同負擔重複。",
    evidence: "規劃委任契約、面積與權利人數計算、加計項目佐證。",
  },
  {
    id: "c2Appraisal",
    groupId: "C",
    code: "C-2",
    title: "不動產估價費用",
    description: "一家估價師事務所估價服務費用 = 40 萬 + 更新前主建物筆數及土地筆數 × 0.45 萬 + 更新後主建物筆數 × 0.45 萬。",
    mode: "manual",
    formula: "估價費 = 400,000 + 更新前筆數 × 4,500 + 更新後筆數 × 4,500；選定費用得加計 30%，且不低於 250,000。",
    basis: "被選定為權利變換基礎之鑑價機構得加計服務費 30%，且不低於 25 萬元。",
    evidence: "估價委任契約、筆數資料、選定鑑價機構資料。",
  },
  {
    id: "c3BoundarySurvey",
    groupId: "C",
    code: "C-3",
    title: "土地鑑界費",
    mode: "quantityUnit",
    quantityLabel: "更新前地號數",
    unitPriceLabel: "單價（元 / 筆）",
    defaultUnitPrice: "4000",
    capUnitPrice: 4000,
    quantitySource: "landNumberCount",
    formula: "土地鑑界費 = 更新前地號數 × 4,000 元",
    basis: "更新前每筆地號 4,000 元。",
    evidence: "地號清冊、鑑界規費資料。",
  },
  {
    id: "c4Boring",
    groupId: "C",
    code: "C-4",
    title: "鑽探費用",
    mode: "quantityUnit",
    quantityLabel: "鑽探孔數",
    unitPriceLabel: "單價（元 / 孔）",
    defaultUnitPrice: "75000",
    capUnitPrice: 75000,
    formula: "鑽探費用 = 鑽探孔數 × 75,000 元 / 孔",
    basis: "新北市上限 75,000 元 / 孔；台北市為 97,500 元 / 孔，本案預設新北市。",
    evidence: "鑽探報告、孔數規劃、契約或報價資料。",
  },
  {
    id: "c5NeighborSurvey",
    groupId: "C",
    code: "C-5",
    title: "鄰房鑑定費用",
    mode: "manual",
    formula: "依新北市建築物施工損壞鄰房事件處理程序及相關公會收費標準計算",
    basis: "需提供鑑定範圍圖及戶數證明。",
    evidence: "鑑定範圍圖、戶數證明、公會收費標準或契約。",
  },
  {
    id: "c6PreMeasurement",
    groupId: "C",
    code: "C-6",
    title: "更新前土地及建物測量費用",
    mode: "manual",
    formula: "依實際狀況認列",
    basis: "須檢具契約影本佐證。",
    evidence: "測量契約影本。",
  },
  {
    id: "c7ImprovementCompensation",
    groupId: "C",
    code: "C-7",
    title: "土地改良物拆遷補償費用",
    mode: "manual",
    formula: "由實施者委任專業估價者查估後評定",
    basis: "合法建築物、非合法建築物、其他土地改良物補償單價均需專業估價。",
    evidence: "估價報告、補償清冊、拆遷計畫。",
    reviewRequired: true,
  },
  {
    id: "c8Relocation",
    groupId: "C",
    code: "C-8",
    title: "拆遷安置費",
    mode: "manual",
    formula: "Σ住宅拆遷安置費 + Σ營業拆遷安置費 + 其他安置費",
    basis: "住宅 = 居住面積 × 住宅租金水準 × 安置期間；營業 = 營業面積 × 營業租金水準 × 安置期間。",
    evidence: "居住 / 營業面積、租金水準、安置期間與補償資料。",
  },
  {
    id: "c9Cadastral",
    groupId: "C",
    code: "C-9",
    title: "地籍整理費用",
    mode: "quantityUnit",
    quantityLabel: "更新後戶數",
    unitPriceLabel: "單價（元 / 戶）",
    defaultUnitPrice: "20000",
    capUnitPrice: 20000,
    formula: "地籍整理費用 = 更新後戶數 × 20,000 元 + 地政機關行政規費",
    basis: "原則以更新後每戶 20,000 元計列，另加計地政機關行政規費。",
    evidence: "更新後戶數、地政規費計算明細。",
  },
  {
    id: "d1LoanInterest",
    groupId: "D",
    code: "D",
    title: "貸款利息",
    mode: "loanInterest",
    formula: "(1) + (2)",
    basis: "(1)〔合法建築物及其他土地改良物拆遷補償費 + G + H〕× 年利率 × 貸款期間；(2)〔(A - 公寓大廈管理基金) + (C - 補償費)〕× 年利率 × 貸款期間 × 0.5。貸款期間不得長於實際施工期間加 12 個月。",
    evidence: "補償費明細、都市計畫變更負擔、容積移轉費、利率資料、施工期間推估。",
  },
  {
    id: "e1StampTax",
    groupId: "E",
    code: "E-1",
    title: "印花稅",
    mode: "manual",
    formula: "依印花稅法第五條規定提列，扣除營業稅計算",
    basis: "依印花稅法及契據類型認列。",
    evidence: "契據金額、印花稅計算表。",
  },
  {
    id: "e2BusinessTax",
    groupId: "E",
    code: "E-2",
    title: "營業稅",
    mode: "manual",
    formula: "依財政部相關函釋擇一計算",
    basis: "本輪先保留輸入欄位與說明，正式公式待稅務資料確認。",
    evidence: "權利價值、共同負擔、稅務試算資料。",
    temporary: true,
  },
  {
    id: "f1AdminOperation",
    groupId: "F",
    code: "F-1",
    title: "行政作業費用",
    mode: "administrativeFee",
    formula: "行政作業費用 = 更新單元內土地公告現值總值 × 2.5%",
    basis: "新北市基準 2.5%。",
    evidence: "土地公告現值總值、主管機關需求資料。",
  },
  {
    id: "f2Trust",
    groupId: "F",
    code: "F-2",
    title: "信託費用",
    mode: "manual",
    formula: "依信託費用表及合約計算",
    basis: "一般建商以 50% 提列；自組更新會或非以更新後房地折價抵付之代執行機構者可提列全額。資金信託全額，土地信託拆半。",
    evidence: "信託契約、費用表、信託拆分明細。",
  },
  {
    id: "f3PersonnelAdmin",
    groupId: "F",
    code: "F-3",
    title: "人事行政管理費用",
    mode: "personnelAdmin",
    formula: "人事行政管理費用 = (A + C + G) × 人事行政管理費率",
    basis: "費率依產權級別與基地面積，最高 6%；本費率為上限，實際仍須說明合理性與必要性並依審議結果。",
    evidence: "產權級別、基地面積、費率合理性說明。",
  },
  {
    id: "f4SalesManagement",
    groupId: "F",
    code: "F-4",
    title: "銷售管理費用",
    mode: "salesManagement",
    formula: "實施者實際獲配單元及車位總價值 × 級距費率",
    basis: "25 億以下部分：6%；超過 25 億至 50 億部分：5.5%；超過 50 億部分：5%，採級距累進。",
    evidence: "實施者實際獲配單元與車位總價值。",
  },
  {
    id: "f5RiskManagement",
    groupId: "F",
    code: "F-5",
    title: "風險管理費用",
    mode: "riskManagement",
    formula: "風險管理費 = (A + C + D + F1 + F2 + F3 + G + H) × 風險管理費率",
    basis: "費率依產權級別及總樓地板面積；最高 14%。共同負擔比率低於 40% 等特定情形仍須審議同意。",
    evidence: "產權級別、總樓地板面積、共同負擔比率與風險說明。",
  },
  {
    id: "g1UrbanPlanChange",
    groupId: "G",
    code: "G",
    title: "都市計畫變更負擔費用",
    mode: "manual",
    formula: "依事業計畫所審定金額",
    basis: "依法令變更都市計畫，應提供或捐贈一定金額、可建築土地或樓地板面積，及辦理都市計畫變更所支付之委辦費。",
    evidence: "都市計畫變更審定資料、捐贈或負擔文件、委辦契約。",
  },
  {
    id: "h1TdrDonation",
    groupId: "H",
    code: "H-1",
    title: "容積移轉費用 - 捐贈送出基地公共設施方式",
    mode: "manual",
    formula: "容積購入費用及委辦費",
    basis: "應檢具相關契約影本佐證。",
    evidence: "送出基地契約、移轉容積文件、委辦費合約。",
    reviewRequired: true,
  },
  {
    id: "h2TdrCashPayment",
    groupId: "H",
    code: "H-2",
    title: "容積移轉費用 - 折繳代金方式",
    mode: "manual",
    formula: "得以估價方式提列所需購入容積移轉費用",
    basis: "正式容積移轉費用仍待估價、契約及主管機關審查確認。",
    evidence: "估價報告、代金試算、主管機關審查資料。",
    temporary: true,
  },
];

const otherCostItemDefinitions = [
  ["landTakeover", "土地讓出 / 承接價款"],
  ["internalDevelopment", "公司整合開發費"],
  ["architectUnconfirmed", "建築師已請款但尚未確認可列共同負擔部分"],
  ["landFinance", "土地融資利息或公司內部資金成本"],
  ["ownerAgreement", "地主協議款"],
  ["companyAdvances", "公司已墊付款"],
  ["brokerConsultant", "仲介 / 協調 / 顧問費"],
  ["taxTransaction", "稅務或交易成本"],
  ["otherInvestment", "其他公司內部投資成本"],
].map(([id, title]) => ({ id, title }));

const defaultCostInputs = {
  commonItems: Object.fromEntries(costCommonItemDefinitions.map((item) => [
    item.id,
    {
      included: true,
      quantity: "",
      unitPrice: item.defaultUnitPrice ?? "",
      amount: "",
      note: "",
      evidence: "",
      temporary: Boolean(item.temporary),
      ...(item.selectField ? { [item.selectField]: item.defaultSelectValue ?? "" } : {}),
      ...(item.mode === "planningFee" ? { xFee: "", yFee: "", otherFee: "" } : {}),
      ...(item.mode === "loanInterest" ? { componentOneAmount: "", componentTwoAmount: "", annualRate: "", loanMonths: "" } : {}),
      ...(item.mode === "administrativeFee" ? { rate: "2.5" } : {}),
      ...(item.mode === "salesManagement" ? { allocationValue: "" } : {}),
      ...(item.mode === "riskManagement" ? { rate: "" } : {}),
    },
  ])),
  otherCostItems: Object.fromEntries(otherCostItemDefinitions.map((item) => [
    item.id,
    {
      amount: "",
      note: "",
      temporary: true,
    },
  ])),
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
    markers: ["板橋民權段自主更新", "泰山文程段", "自主更新 / 前期評估", "林顧問", "都更清冊標準匯入測試"],
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

function normalizeBuildCommit(value) {
  const commit = String(value || "").trim();
  return /^[0-9a-f]{7,40}$/i.test(commit) ? commit.toLowerCase() : UNKNOWN_BUILD_COMMIT;
}

function normalizeBuildCommitSource(value) {
  const source = String(value || "").trim();
  return source || "fallback-unknown";
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
  costInputsByCaseId,
  costResultsByCaseId,
}) {
  const normalizedCases = Array.isArray(cases) ? cases : [];
  const normalizedCurrentCaseId = resolveImportedCurrentCaseId(normalizedCases, currentCaseId);
  const normalizedRosterStaging = normalizeRosterStagingByCaseId(rosterStagingByCaseId);
  const normalizedBaseInfo = isPlainRecord(baseInfoByCaseId) ? baseInfoByCaseId : {};
  const normalizedCapacityInputs = isPlainRecord(capacityInputsByCaseId) ? capacityInputsByCaseId : {};
  const normalizedFloorEfficiencyParams = isPlainRecord(floorEfficiencyParamsByCaseId) ? floorEfficiencyParamsByCaseId : {};
  const normalizedCostInputs = isPlainRecord(costInputsByCaseId) ? costInputsByCaseId : {};
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
  const {
    costInputsByCaseId: completeCostInputs,
    costResultsByCaseId: completeCostResults,
  } = buildCompleteCostRecordsByCaseId({
    cases: normalizedCases,
    costInputsByCaseId: normalizedCostInputs,
    costResultsByCaseId,
    rosterStagingByCaseId: normalizedRosterStaging,
    baseInfoByCaseId: normalizedBaseInfo,
    capacityResultsByCaseId: recalculatedCapacityResults,
    floorEfficiencyResultsByCaseId: recalculatedFloorEfficiencyResults,
  });
  const recordData = {
    capacityInputsByCaseId: normalizedCapacityInputs,
    capacityResultsByCaseId: recalculatedCapacityResults,
    floorEfficiencyParamsByCaseId: normalizedFloorEfficiencyParams,
    floorEfficiencyResultsByCaseId: recalculatedFloorEfficiencyResults,
    costInputsByCaseId: completeCostInputs,
    costResultsByCaseId: completeCostResults,
  };
  const exportedAt = new Date().toISOString();

  LOCAL_TEST_DATA_RECORD_FIELDS.forEach(({ dataKey, storageKey }) => {
    if (recordData[dataKey] === undefined) {
      recordData[dataKey] = loadStoredRecord(storageKey);
    }
  });

  return {
    app: LOCAL_TEST_DATA_APP,
    type: LOCAL_TEST_DATA_TYPE,
    schemaVersion: LOCAL_TEST_DATA_SCHEMA_VERSION,
    exportedAt,
    source: {
      app: LOCAL_TEST_DATA_APP,
      schemaVersion: LOCAL_TEST_DATA_SCHEMA_VERSION,
      exportedAt,
      origin: getSourceOrigin(),
      exportFormatVersion: EVALUATION_SYSTEM_EXPORT_FORMAT_VERSION,
      commitHint: EVALUATION_SYSTEM_BUILD_COMMIT,
      exportSourceCommit: EVALUATION_SYSTEM_BUILD_COMMIT,
      commitSource: EVALUATION_SYSTEM_BUILD_COMMIT_SOURCE,
      baseCommit: EVALUATION_SYSTEM_BASE_COMMIT,
      exportFeatureVersion: EVALUATION_SYSTEM_EXPORT_FEATURE_VERSION,
      appBuildLabel: EVALUATION_SYSTEM_BUILD_LABEL,
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
  downloadBlobFile(blob, fileName);
}

function downloadBlobFile(blob, fileName) {
  if (typeof document === "undefined") {
    return;
  }

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
      rosterStagingByCaseId: normalizeRosterStagingByCaseId(payload.data.rosterStagingByCaseId),
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
    <details className="eval-module-flow-brief" aria-label={`${module.title} 資料串聯`}>
      <summary>
        <p className="eval-kicker">FLOW</p>
        <strong>{flow.stage}</strong>
        <span>資料串聯</span>
      </summary>
      <div className="eval-module-flow-brief__grid">
        <div className="eval-flow-mini-card eval-flow-mini-card--wide">
          <strong>模組定位</strong>
          <p>{flow.summary}</p>
        </div>
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
          <strong>資料層級</strong>
          <p>
            案件層級：{flow.sharedData.join("、")}。試算 / 版本層級：{flow.versionData.join("、")}。
          </p>
        </div>
      </div>
    </details>
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
            : "確定要刪除此案件嗎？此操作會移除目前瀏覽器中的案件與關聯評估資料。"}
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
            : "此操作會清除目前瀏覽器中的案件、清冊暫存、基地、容積、坪效與後續模組資料；清除前會再次確認。"}
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

async function readApiJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function formatDatabaseApiDebug(payload) {
  const parts = [];
  const debug = isPlainRecord(payload?.debug) ? payload.debug : {};

  if (typeof payload?.step === "string" && payload.step) {
    parts.push(`step=${payload.step}`);
  }

  [
    ["code", debug.supabaseCode],
    ["message", debug.supabaseMessage],
    ["details", debug.supabaseDetails],
    ["hint", debug.supabaseHint],
  ].forEach(([label, value]) => {
    if (typeof value === "string" && value.trim()) {
      parts.push(`${label}=${value.trim()}`);
    }
  });

  return parts.join(" | ");
}

function buildDatabaseApiError(payload, fallbackMessage) {
  return {
    message: payload?.message || fallbackMessage,
    debug: formatDatabaseApiDebug(payload),
  };
}

function normalizeDatabaseLoadPayload(payload) {
  const cases = Array.isArray(payload?.cases) ? payload.cases : [];
  return {
    cases,
    rosterStagingByCaseId: normalizeRosterStagingByCaseId(payload?.rosterStagingByCaseId),
    baseInfoByCaseId: isPlainRecord(payload?.baseInfoByCaseId) ? payload.baseInfoByCaseId : {},
    capacityInputsByCaseId: isPlainRecord(payload?.capacityInputsByCaseId) ? payload.capacityInputsByCaseId : {},
    capacityResultsByCaseId: isPlainRecord(payload?.capacityResultsByCaseId) ? payload.capacityResultsByCaseId : {},
    floorEfficiencyParamsByCaseId: isPlainRecord(payload?.floorEfficiencyParamsByCaseId) ? payload.floorEfficiencyParamsByCaseId : {},
    floorEfficiencyResultsByCaseId: isPlainRecord(payload?.floorEfficiencyResultsByCaseId) ? payload.floorEfficiencyResultsByCaseId : {},
    costInputsByCaseId: isPlainRecord(payload?.costInputsByCaseId) ? payload.costInputsByCaseId : {},
    costResultsByCaseId: isPlainRecord(payload?.costResultsByCaseId) ? payload.costResultsByCaseId : {},
    loadedAt: typeof payload?.loadedAt === "string" ? payload.loadedAt : "",
  };
}

function hasMeaningfulRecord(value) {
  return isPlainRecord(value) && Object.keys(value).length > 0;
}

function formatSyncPresence(value) {
  return value ? "有" : "無";
}

function formatSyncTimestamp(value) {
  if (!value) {
    return "尚未同步";
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-TW", { hour12: false });
}

function buildDatabaseCaseSummary({
  caseItem,
  rosterStaging,
  capacityInputs,
  capacityResults,
  floorEfficiencyParams,
  floorEfficiencyResults,
  costInputs,
  costResults,
  syncedAt,
}) {
  const normalizedRoster = normalizeRosterStaging(rosterStaging) ?? {};
  return {
    caseName: caseItem?.name || caseItem?.case_name || "未命名案件",
    landRowCount: getRosterLandRows(normalizedRoster).length,
    buildingRowCount: getRosterBuildingRows(normalizedRoster).length,
    hasCapacityData: hasMeaningfulRecord(capacityInputs) || hasMeaningfulRecord(capacityResults),
    hasFloorEfficiencyData: hasMeaningfulRecord(floorEfficiencyParams) || hasMeaningfulRecord(floorEfficiencyResults),
    hasCostData: hasMeaningfulRecord(costInputs) || hasMeaningfulRecord(costResults),
    syncedAt: syncedAt || "",
  };
}

function buildDatabaseLoadPreviewSummary(payload) {
  const loaded = normalizeDatabaseLoadPayload(payload);
  const rosterCaseCount = countCaseRecords(loaded.rosterStagingByCaseId);
  const capacityCaseCount = countCaseRecords(loaded.capacityInputsByCaseId, loaded.capacityResultsByCaseId);
  const floorCaseCount = countCaseRecords(loaded.floorEfficiencyParamsByCaseId, loaded.floorEfficiencyResultsByCaseId);
  const costCaseCount = countCaseRecords(loaded.costInputsByCaseId, loaded.costResultsByCaseId);
  const landRowCount = Object.values(loaded.rosterStagingByCaseId)
    .reduce((total, roster) => total + getRosterLandRows(roster).length, 0);
  const buildingRowCount = Object.values(loaded.rosterStagingByCaseId)
    .reduce((total, roster) => total + getRosterBuildingRows(roster).length, 0);

  return {
    caseCount: loaded.cases.length,
    rosterCaseCount,
    capacityCaseCount,
    floorCaseCount,
    costCaseCount,
    landRowCount,
    buildingRowCount,
    loadedAt: loaded.loadedAt,
    cases: loaded.cases,
  };
}

function DatabaseConnectionStatus() {
  const [connectionState, setConnectionState] = useState({
    status: "checking",
    label: "檢查中",
    detail: "目前仍使用本機測試資料。",
    description: "第一階段僅檢查 Supabase Vite env 與 API 可達性，尚未啟用案件資料同步。",
  });

  useEffect(() => {
    let isMounted = true;

    checkSupabaseConnection().then((nextState) => {
      if (isMounted) {
        setConnectionState(nextState);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="eval-module-section eval-database-status">
      <div className="eval-section-head">
        <h4>資料庫連線狀態</h4>
        <p>{connectionState.description || "第一階段僅檢查 Supabase Vite env 與 API 可達性，尚未啟用案件資料同步。"}</p>
      </div>
      <div className="eval-database-status__body">
        <article data-status={connectionState.status}>
          <span>狀態</span>
          <strong>{connectionState.label}</strong>
        </article>
        <article>
          <span>資料來源</span>
          <strong>{connectionState.detail}</strong>
        </article>
      </div>
    </section>
  );
}

function DatabaseSyncControls({
  currentCase,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityInputsByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyParamsByCaseId,
  floorEfficiencyResultsByCaseId,
  costInputsByCaseId,
  costResultsByCaseId,
  onApplyDatabaseCases,
}) {
  const [syncState, setSyncState] = useState({
    status: "idle",
    message: "尚未同步。",
    error: "",
    debug: "",
    backendConfigured: null,
    lastSyncedAt: "",
  });
  const [loadPreview, setLoadPreview] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const isBusy = syncState.status === "syncing" || syncState.status === "loading";
  const isBackendUnavailable = syncState.backendConfigured === false;
  const currentCaseSummary = currentCase
    ? buildDatabaseCaseSummary({
      caseItem: currentCase,
      rosterStaging: rosterStagingByCaseId[currentCase.id],
      capacityInputs: capacityInputsByCaseId[currentCase.id],
      capacityResults: capacityResultsByCaseId[currentCase.id],
      floorEfficiencyParams: floorEfficiencyParamsByCaseId[currentCase.id],
      floorEfficiencyResults: floorEfficiencyResultsByCaseId[currentCase.id],
      costInputs: costInputsByCaseId[currentCase.id],
      costResults: costResultsByCaseId[currentCase.id],
      syncedAt: syncState.lastSyncedAt,
    })
    : null;
  const loadPreviewSummary = loadPreview ? buildDatabaseLoadPreviewSummary(loadPreview) : null;
  const canApplyPreview = Boolean(loadPreview && isPreviewVisible && !isBusy && !isBackendUnavailable);

  const handleSyncCurrentCase = async () => {
    if (!currentCase) {
      setSyncState({
        status: "error",
        message: "",
        error: "請先建立或選取案件，再同步到資料庫。",
        debug: "",
        backendConfigured: syncState.backendConfigured,
        lastSyncedAt: syncState.lastSyncedAt,
      });
      return;
    }

    setSyncState((current) => ({ ...current, status: "syncing", message: "", error: "", debug: "" }));

    try {
      const response = await fetch("/api/sanze-db-sync-case", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case: currentCase,
          rosterStaging: rosterStagingByCaseId[currentCase.id] ?? null,
          baseInfo: baseInfoByCaseId[currentCase.id] ?? {},
          capacityInputs: capacityInputsByCaseId[currentCase.id] ?? {},
          capacityResults: capacityResultsByCaseId[currentCase.id] ?? {},
          floorEfficiencyParams: floorEfficiencyParamsByCaseId[currentCase.id] ?? {},
          floorEfficiencyResults: floorEfficiencyResultsByCaseId[currentCase.id] ?? {},
          costInputs: costInputsByCaseId[currentCase.id] ?? {},
          costResults: costResultsByCaseId[currentCase.id] ?? {},
        }),
      });
      const payload = await readApiJson(response);

      if (!response.ok || !payload.ok) {
        const isNotConfigured = payload.code === "DB_SYNC_NOT_CONFIGURED";
        const apiError = buildDatabaseApiError(payload, "資料庫同步失敗，目前仍使用本機測試資料。");
        setSyncState({
          status: "error",
          message: "",
          error: apiError.message,
          debug: apiError.debug,
          backendConfigured: isNotConfigured ? false : syncState.backendConfigured,
          lastSyncedAt: syncState.lastSyncedAt,
        });
        return;
      }

      setSyncState({
        status: "success",
        message: `同步成功：${payload.summary?.caseName || currentCase.name || "目前案件"} 已寫入 ${payload.syncedTables?.length ?? 0} 張核心資料表。`,
        error: "",
        debug: "",
        backendConfigured: true,
        lastSyncedAt: payload.updatedAt || new Date().toISOString(),
      });
    } catch {
      setSyncState({
        status: "error",
        message: "",
        error: "資料庫同步失敗，目前仍使用本機測試資料。",
        debug: "",
        backendConfigured: syncState.backendConfigured,
        lastSyncedAt: syncState.lastSyncedAt,
      });
    }
  };

  const handleLoadDatabaseCases = async () => {
    setSyncState((current) => ({ ...current, status: "loading", message: "", error: "", debug: "" }));

    try {
      const response = await fetch("/api/sanze-db-load-cases", {
        method: "GET",
        credentials: "include",
      });
      const payload = await readApiJson(response);

      if (!response.ok || !payload.ok) {
        const isNotConfigured = payload.code === "DB_SYNC_NOT_CONFIGURED";
        const apiError = buildDatabaseApiError(payload, "資料庫載入失敗，目前仍保留本機測試資料。");
        setSyncState({
          status: "error",
          message: "",
          error: apiError.message,
          debug: apiError.debug,
          backendConfigured: isNotConfigured ? false : syncState.backendConfigured,
          lastSyncedAt: syncState.lastSyncedAt,
        });
        return;
      }

      setLoadPreview(payload);
      setIsPreviewVisible(false);
      setSyncState({
        status: "loaded",
        message: `已從資料庫載入 ${payload.cases?.length ?? 0} 筆案件，等待使用者確認合併或取代。`,
        error: "",
        debug: "",
        backendConfigured: true,
        lastSyncedAt: syncState.lastSyncedAt,
      });
    } catch {
      setSyncState({
        status: "error",
        message: "",
        error: "資料庫載入失敗，目前仍保留本機測試資料。",
        debug: "",
        backendConfigured: syncState.backendConfigured,
        lastSyncedAt: syncState.lastSyncedAt,
      });
    }
  };

  const handlePreviewLoadedCases = () => {
    if (!loadPreview) {
      return;
    }

    setIsPreviewVisible(true);
    setSyncState((current) => ({
      ...current,
      status: "awaiting-confirmation",
      message: "已顯示載入預覽，請確認合併或取代本機資料。",
      error: "",
      debug: "",
    }));
  };

  const handleApplyLoadedCases = (mode) => {
    if (!loadPreview || !isPreviewVisible) {
      setSyncState((current) => ({
        ...current,
        status: "awaiting-confirmation",
        message: "",
        error: "請先預覽載入結果，再確認合併或取代本機資料。",
        debug: "",
      }));
      return;
    }

    if (mode === "replace") {
      const confirmed = window.confirm("取代會以資料庫載入案件覆蓋目前本機測試資料，並清除尚未納入 DB 同步的後續模組暫存。是否確認取代？");
      if (!confirmed) {
        return;
      }
    }

    const applied = onApplyDatabaseCases(loadPreview, mode);
    setSyncState((current) => ({
      ...current,
      status: "success",
      message: mode === "replace"
        ? `已取代本機資料：套用 ${applied.caseCount} 筆資料庫案件。`
        : `已合併到本機資料：套用 ${applied.caseCount} 筆資料庫案件。`,
      error: "",
      debug: "",
    }));
  };

  const syncStatusLabel = {
    idle: "尚未同步",
    syncing: "同步中",
    loading: "載入中",
    loaded: "已從資料庫載入",
    "awaiting-confirmation": "等待使用者確認合併 / 取代",
    success: "同步成功",
    error: "同步失敗",
  }[syncState.status] || "尚未同步";

  return (
    <section className="eval-module-section eval-database-sync">
      <div className="eval-section-head">
        <h4>資料庫同步</h4>
        <p>目前採 localStorage + Supabase 並行模式。操作時仍會先寫入本機測試資料；可手動同步到資料庫，或從資料庫載入案件資料。</p>
      </div>
      <ul className="eval-database-sync-notes">
        <li>目前仍以本機測試資料為主，同步失敗不會清空 localStorage。</li>
        <li>本階段同步案件主檔、清冊 staging、基地、容積/TDR、坪效與成本資料。</li>
        <li>實價登錄、銷售情境、權利分配、現金流與銀行報告將在下一階段開放。</li>
        <li>正式多人權限、案件權限與稽核紀錄需在 Auth / RLS policy / user-case mapping 完成後啟用。</li>
      </ul>
      <div className="eval-database-sync-state" data-status={syncState.status}>
        <span>狀態</span>
        <strong>{syncStatusLabel}</strong>
        <p>{syncState.message || "目前仍使用本機測試資料。"}</p>
      </div>
      {currentCaseSummary && (
        <div className="eval-database-sync-summary" aria-label="目前案件同步摘要">
          <article>
            <span>同步案件名稱</span>
            <strong>{currentCaseSummary.caseName}</strong>
          </article>
          <article>
            <span>土地 / 建物列數</span>
            <strong>{currentCaseSummary.landRowCount} / {currentCaseSummary.buildingRowCount}</strong>
          </article>
          <article>
            <span>容積資料</span>
            <strong>{formatSyncPresence(currentCaseSummary.hasCapacityData)}</strong>
          </article>
          <article>
            <span>坪效資料</span>
            <strong>{formatSyncPresence(currentCaseSummary.hasFloorEfficiencyData)}</strong>
          </article>
          <article>
            <span>成本資料</span>
            <strong>{formatSyncPresence(currentCaseSummary.hasCostData)}</strong>
          </article>
          <article>
            <span>最後同步時間</span>
            <strong>{formatSyncTimestamp(currentCaseSummary.syncedAt)}</strong>
          </article>
        </div>
      )}
      {isBackendUnavailable && (
        <p className="eval-database-sync-message eval-database-sync-message--error">
          後端資料庫同步尚未設定，請設定 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY。
        </p>
      )}
      <div className="eval-database-sync-actions">
        <button type="button" onClick={handleSyncCurrentCase} disabled={isBusy || isBackendUnavailable || !currentCase}>
          同步目前案件到資料庫
        </button>
        <button type="button" onClick={handleLoadDatabaseCases} disabled={isBusy || isBackendUnavailable}>
          從資料庫載入案件列表
        </button>
        <button type="button" onClick={handlePreviewLoadedCases} disabled={isBusy || !loadPreview}>
          預覽載入結果
        </button>
        <button type="button" onClick={() => handleApplyLoadedCases("merge")} disabled={!canApplyPreview}>
          確認合併到本機資料
        </button>
        <button type="button" onClick={() => handleApplyLoadedCases("replace")} disabled={!canApplyPreview}>
          確認取代本機資料
        </button>
      </div>
      {syncState.error && (
        <div className="eval-database-sync-message eval-database-sync-message--error">
          <p>{syncState.error}</p>
          {syncState.debug && <p className="eval-database-sync-debug">{syncState.debug}</p>}
        </div>
      )}
      {isPreviewVisible && loadPreviewSummary && (
        <div className="eval-database-sync-preview">
          <div>
            <strong>資料庫載入預覽</strong>
            <p>
              載入 {loadPreviewSummary.caseCount} 筆案件、{loadPreviewSummary.landRowCount} 筆土地列、
              {loadPreviewSummary.buildingRowCount} 筆建物列。確認前不會寫入 localStorage。
            </p>
          </div>
          <dl>
            <div>
              <dt>清冊案件</dt>
              <dd>{loadPreviewSummary.rosterCaseCount}</dd>
            </div>
            <div>
              <dt>容積案件</dt>
              <dd>{loadPreviewSummary.capacityCaseCount}</dd>
            </div>
            <div>
              <dt>坪效案件</dt>
              <dd>{loadPreviewSummary.floorCaseCount}</dd>
            </div>
            <div>
              <dt>成本案件</dt>
              <dd>{loadPreviewSummary.costCaseCount}</dd>
            </div>
            <div>
              <dt>載入時間</dt>
              <dd>{formatSyncTimestamp(loadPreviewSummary.loadedAt)}</dd>
            </div>
          </dl>
          <ul>
            {loadPreviewSummary.cases.slice(0, 5).map((caseItem) => (
              <li key={caseItem.id || caseItem.code || caseItem.name}>
                {caseItem.code ? `${caseItem.code} / ` : ""}{caseItem.name || "未命名案件"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
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
  costInputsByCaseId,
  costResultsByCaseId,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onSelectCase,
  onClearLocalTestData,
  onImportLocalTestData,
  onLoadDatabaseCases,
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

  const handleClearCaseForm = () => {
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
      costInputsByCaseId,
      costResultsByCaseId,
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
      <section className="eval-module-section">
        <div className="eval-section-head">
          <h4>{currentCase ? `目前案件：${currentCase.name}` : "目前尚未選取案件"}</h4>
          <p>後續基地、清冊、容積與坪效資料都會掛在目前案件底下。</p>
        </div>
        <CurrentCaseSummary currentCase={currentCase} compact />
      </section>

      <section className="eval-module-section">
        <div className="eval-section-head">
          <h4>{editingCase ? "編輯案件" : "案件列表"}</h4>
          <p>
            {editingCase
              ? `正在編輯：${editingCase.name || "未命名案件"}。儲存後案件列表與目前案件 context 會同步更新。`
              : "新增、選取或維護目前評估案件。"}
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
            <input type="text" value={caseForm.note} onChange={handleChange("note")} placeholder="初始建立" />
          </label>
          <div className="eval-case-form-actions" aria-label={editingCase ? "案件編輯操作" : "案件新增操作"}>
            <p className="eval-case-form-hint">
              {editingCase ? "編輯儲存後會更新案件摘要與本機測試資料。" : "新增成功後會自動成為目前案件，並保留於本機測試資料。"}
            </p>
            <div className="eval-case-form-buttons">
              <button type="submit" className="eval-case-form-primary case-form-primary-action">
                {editingCase ? "儲存案件修改" : "新增案件"}
              </button>
              {editingCase ? (
                <button type="button" className="eval-case-form-secondary case-form-secondary-action" onClick={handleCancelEdit}>
                  取消編輯
                </button>
              ) : (
                <button type="button" className="eval-case-form-secondary case-form-secondary-action" onClick={handleClearCaseForm}>
                  清空表單
                </button>
              )}
            </div>
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
                        {currentCase?.id === item.id ? (
                          <span className="eval-current-case-pill">已選定</span>
                        ) : (
                          <button type="button" className="eval-small-action" onClick={() => onSelectCase(item.id)}>
                            選為目前案件
                          </button>
                        )}
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
          <p>匯出、匯入或清除目前瀏覽器中的評估資料。</p>
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
              <p>下載目前案件、清冊、基地、容積與坪效資料。</p>
            </div>
            <button type="button" onClick={handleExportLocalTestData}>
              匯出本機測試資料
            </button>
          </article>
          <article className="eval-local-test-card">
            <div>
              <strong>匯入本機測試資料</strong>
              <p>匯入三策評估系統 JSON，匯入前會再次確認。</p>
            </div>
            <button type="button" onClick={handleImportFileRequest}>
              選擇 JSON 匯入
            </button>
          </article>
          <article className="eval-local-test-card eval-local-test-card--danger">
            <div>
              <strong>清除本機測試資料</strong>
              <p>清除目前瀏覽器中的評估資料，會保留二次確認。</p>
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

      <DatabaseConnectionStatus />
      <DatabaseSyncControls
        currentCase={currentCase}
        rosterStagingByCaseId={rosterStagingByCaseId}
        baseInfoByCaseId={baseInfoByCaseId}
        capacityInputsByCaseId={capacityInputsByCaseId}
        capacityResultsByCaseId={capacityResultsByCaseId}
        floorEfficiencyParamsByCaseId={floorEfficiencyParamsByCaseId}
        floorEfficiencyResultsByCaseId={floorEfficiencyResultsByCaseId}
        costInputsByCaseId={costInputsByCaseId}
        costResultsByCaseId={costResultsByCaseId}
        onApplyDatabaseCases={onLoadDatabaseCases}
      />

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

function TakeoverEvaluationModule({ currentCase, currentCapacityResults, currentFloorEfficiencyResults }) {
  const saleableAreaSqm = pickNumericValue(
    currentFloorEfficiencyResults?.saleableAreaSqm,
    currentFloorEfficiencyResults?.estimatedSaleableAreaSqm,
  );
  const sourceItems = [
    ["目前案件", currentCase ? `${currentCase.code} / ${currentCase.name}` : "尚未選定案件"],
    ["容積來源", Number.isFinite(currentCapacityResults?.totalCapacityAreaSqm) ? `總容積量 ${formatSqmAndPing(currentCapacityResults.totalCapacityAreaSqm)}` : "待容積試算"],
    ["坪效結果", Number.isFinite(saleableAreaSqm) ? `銷售面積 ${formatSqmAndPing(saleableAreaSqm)}` : "待坪效計算"],
  ];

  return (
    <div className="eval-module-stack">
      <section className="eval-module-section eval-downstream-notice">
        <div className="eval-section-head">
          <h4>承接 / 讓出評估</h4>
          <p>本模組將承接基地、容積、坪效、成本、銷售與權利資料，用來判斷既有條件是否適合承接、協助或讓出。</p>
        </div>
        <DataSummaryGrid items={sourceItems} />
        <details className="eval-inline-details">
          <summary>下一階段建置範圍</summary>
          <ul>
            <li>既有條件輸入與版本紀錄</li>
            <li>整合進度與分配條件檢核</li>
            <li>承接風險摘要與建議處理方向</li>
          </ul>
        </details>
      </section>
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
          <span key={action}>
            {action}
          </span>
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

const ROSTER_TEMPLATE_DOWNLOAD_FILENAME = "sanze-urban-renewal-roster-template.xlsx";

const rosterImportFieldAliases = {
  city: ["縣市", "市縣", "city", "county"],
  district: ["行政區", "鄉鎮市區", "區", "district", "town"],
  section: ["段別", "地段", "段名", "section"],
  subsection: ["小段", "小段別", "subsection"],
  lotNumber: ["地號", "土地地號", "地段地號", "lotNo", "lotNumber"],
};

const rosterImportModeOptions = [
  {
    value: "replace",
    label: "取代目前清冊",
    description: "以本次預覽清冊取代目前案件清冊。會保留舊清冊到版本紀錄，需二次確認。",
    enabled: true,
  },
  {
    value: "merge",
    label: "合併到目前清冊",
    description: "將本次預覽清冊合併到目前清冊；相同資料不重複新增，差異資料列入人工確認。",
    enabled: true,
  },
  {
    value: "new-version",
    label: "建立新清冊版本",
    description: "不覆蓋目前清冊，將本次預覽清冊保存為新版本，日後可套用或比對。",
    enabled: true,
  },
  {
    value: "land-value-update",
    label: "只更新公告現值 / 申報地價",
    description: "只依相同地籍定位更新公告現值、申報地價與年度，不變更權利人、面積與持分。",
    enabled: true,
  },
];

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

function getRosterFieldValue(row, aliases, fallbackKeywords = []) {
  return getFirstExactHeaderValue(row, aliases) || getFirstMatchingValue(row, fallbackKeywords);
}

function getMappedRosterValue(row, fieldKeys = [], exactHeaders = [], fallbackKeywords = exactHeaders) {
  const directValue = fieldKeys
    .map((key) => normalizeCellValue(row?.[key]))
    .find(Boolean);

  return directValue || getHeaderValue(row, exactHeaders, fallbackKeywords);
}

function normalizeLandRightLocationFields(row) {
  const city = normalizeLandKeyPart(row?.city || row?.["縣市"] || row?.county);
  const district = normalizeLandKeyPart(row?.district || row?.["行政區"] || row?.town);
  const section = normalizeLandKeyPart(row?.section || row?.["段別"] || row?.["地段"]);
  const subsection = normalizeLandKeyPart(row?.subsection || row?.["小段"]);
  const lotNumber = normalizeLandKeyPart(row?.lotNumber || row?.landNumber || row?.parcelNumber || row?.["地號"]);
  const landNumber = normalizeLandKeyPart(row?.landNumber || row?.lotNumber || row?.parcelNumber || row?.["地號"]);
  const normalizedRow = {
    ...row,
    city,
    district,
    section,
    subsection,
    lotNumber,
    landNumber,
  };
  const identity = buildLandIdentity(normalizedRow);

  return {
    ...normalizedRow,
    landIdentityKey: identity.key,
    lotIdentityKey: identity.key,
    landDisplayLabel: identity.displayLabel,
    landIdentityMissingParts: identity.missingParts,
    landIdentityFallback: identity.hasFallbackRisk,
  };
}

function normalizeRosterLandRightRow(row, index = 0) {
  const locationRow = normalizeLandRightLocationFields(row);
  const landAreaSqm = parseRosterNumber(locationRow.landAreaSqm || locationRow.landAreaRaw || locationRow["土地面積㎡"] || locationRow["土地面積"]);
  const shareNumerator = normalizeCellValue(locationRow.shareNumerator || locationRow["持分分子"]);
  const shareDenominator = normalizeCellValue(locationRow.shareDenominator || locationRow["持分分母"]);
  const originalShareAreaSqm = pickNumericValue(
    parseRosterNumber(locationRow.originalShareAreaSqm),
    parseRosterNumber(locationRow.excelShareAreaSqm),
  );
  const shareAreaQuality = evaluateLandShareArea({
    landAreaSqm,
    shareNumerator,
    shareDenominator,
    originalShareAreaSqm,
    existingShareAreaSqm: locationRow.shareAreaSqm,
  });
  const shareRatio = pickNumericValue(
    parseRatio(locationRow.shareNumerator, locationRow.shareDenominator),
    parseRosterNumber(locationRow.calculatedShareRatio),
    parseRosterNumber(locationRow.shareRatio),
  );
  const shareAreaSqm = pickNumericValue(shareAreaQuality.shareAreaSqm, parseRosterNumber(locationRow.calculatedShareAreaSqm));
  const shareAreaPing = pickNumericValue(
    shareAreaQuality.shareAreaPing,
    parseRosterNumber(locationRow.calculatedShareAreaPing),
    Number.isFinite(shareAreaSqm) ? sqmToPing(shareAreaSqm) : null,
  );
  const rowId = normalizeCellValue(locationRow.rowId || locationRow.landRightRowId) || formatSequence("LR", index);
  const importedAt = normalizeCellValue(locationRow.importedAt);

  return {
    ...locationRow,
    rowId,
    landRightRowId: normalizeCellValue(locationRow.landRightRowId) || rowId,
    registrationOrder: normalizeCellValue(locationRow.registrationOrder || locationRow["登記次序"]),
    ownerName: normalizeCellValue(locationRow.ownerName || locationRow["地主姓名"] || locationRow["所有權人"]),
    registeredOwnerName: normalizeCellValue(locationRow.registeredOwnerName || locationRow["登記名義人"] || locationRow["所有權人"]),
    trusteeName: normalizeCellValue(locationRow.trusteeName || locationRow["受託人"]),
    trustorName: normalizeCellValue(locationRow.trustorName || locationRow["委託人"]),
    ownershipType: normalizeCellValue(locationRow.ownershipType || locationRow["權利型態"]),
    landAreaSqm: Number.isFinite(landAreaSqm) ? roundForStorage(landAreaSqm, INTERNAL_DECIMAL_DIGITS) : "",
    shareNumerator,
    shareDenominator,
    shareRatio: Number.isFinite(shareRatio) ? roundForStorage(shareRatio, INTERNAL_DECIMAL_DIGITS) : "",
    originalShareAreaSqm: Number.isFinite(shareAreaQuality.originalShareAreaSqm) ? shareAreaQuality.originalShareAreaSqm : "",
    calculatedShareAreaSqm: Number.isFinite(shareAreaQuality.calculatedShareAreaSqm) ? shareAreaQuality.calculatedShareAreaSqm : "",
    calculatedShareAreaPing: Number.isFinite(shareAreaQuality.calculatedShareAreaPing) ? shareAreaQuality.calculatedShareAreaPing : "",
    shareAreaSqm: Number.isFinite(shareAreaSqm) ? roundForStorage(shareAreaSqm, INTERNAL_DECIMAL_DIGITS) : "",
    shareAreaPing: Number.isFinite(shareAreaPing) ? roundForStorage(shareAreaPing, INTERNAL_DECIMAL_DIGITS) : "",
    shareAreaSource: shareAreaQuality.shareAreaSource,
    shareAreaValidationStatus: shareAreaQuality.shareAreaValidationStatus,
    shareAreaDifferenceSqm: Number.isFinite(shareAreaQuality.shareAreaDifferenceSqm) ? shareAreaQuality.shareAreaDifferenceSqm : "",
    shareAreaValidationMessages: shareAreaQuality.shareAreaValidationMessages,
    shareAreaCanCalculate: shareAreaQuality.shareAreaCanCalculate,
    shareAreaWithinTolerance: shareAreaQuality.shareAreaWithinTolerance,
    shareAreaSuspectedColumnMisalignment: shareAreaQuality.shareAreaSuspectedColumnMisalignment,
    standardSchemaVersion: normalizeCellValue(locationRow.standardSchemaVersion) || ROSTER_STANDARD_SCHEMA_VERSION,
    landSequence: normalizeCellValue(locationRow.landSequence || locationRow["序號"]),
    sectionName: locationRow.sectionName || locationRow.section,
    ownerRegistrationOrder: normalizeCellValue(locationRow.ownerRegistrationOrder || locationRow.registrationOrder || locationRow["登記次序"]),
    ownerIdNumber: normalizeCellValue(locationRow.ownerIdNumber || locationRow.maskedIdentityCode || locationRow["身分證字號"]),
    shareDisplay: formatShareText(shareNumerator, shareDenominator, locationRow.shareText),
    otherRightRegistrationOrder: normalizeCellValue(locationRow.otherRightRegistrationOrder || locationRow["他項權利登記次序"]),
    otherRightType: normalizeCellValue(locationRow.otherRightType || locationRow.otherRightsType || locationRow["權利種類"] || locationRow["他項權利種類"]),
    otherRightHolder: normalizeCellValue(locationRow.otherRightHolder || locationRow.otherRightsHolder || locationRow["他項權利人"]),
    debtor: normalizeCellValue(locationRow.debtor || locationRow["債務人"]),
    debtorAndDebtRatio: normalizeCellValue(locationRow.debtorAndDebtRatio || locationRow["債務人及債務額比例"]),
    obligor: normalizeCellValue(locationRow.obligor || locationRow["設定義務人"]),
    securedAmount: normalizeCellValue(locationRow.securedAmount || locationRow.amount || locationRow["金額"]),
    note: normalizeCellValue(locationRow.note || locationRow.notes || locationRow["備註"]),
    transcriptAddress: normalizeCellValue(locationRow.transcriptAddress || locationRow.address || locationRow["謄本地址"]),
    parseStatus: normalizeCellValue(locationRow.parseStatus) || (shareAreaQuality.shareAreaValidationMessages.length ? "needs-review" : "parsed"),
    validationMessages: Array.isArray(locationRow.validationMessages)
      ? [...new Set([...locationRow.validationMessages, ...shareAreaQuality.shareAreaValidationMessages])]
      : shareAreaQuality.shareAreaValidationMessages,
    originalFields: locationRow.originalFields ?? {
      landAreaSqm: locationRow.landAreaSqm || locationRow.landAreaRaw || locationRow["土地面積㎡"] || locationRow["土地面積"],
      shareNumerator,
      shareDenominator,
      shareAreaSqm: originalShareAreaSqm,
    },
    computedFields: {
      ...(locationRow.computedFields ?? {}),
      shareRatio: Number.isFinite(shareRatio) ? roundForStorage(shareRatio, INTERNAL_DECIMAL_DIGITS) : "",
      shareAreaSqm: shareAreaQuality.calculatedShareAreaSqm,
      shareAreaPing: shareAreaQuality.calculatedShareAreaPing,
    },
    announcedCurrentValue: normalizeCellValue(
      locationRow.announcedCurrentValue
        || locationRow.announcedLandValue
        || locationRow["公告土地現值"]
        || locationRow["公告現值"],
    ),
    announcedCurrentValueYear: normalizeCellValue(locationRow.announcedCurrentValueYear || locationRow["公告現值年度"] || locationRow["公告土地現值年度"]),
    declaredLandValue: normalizeCellValue(locationRow.declaredLandValue || locationRow["申報地價"] || locationRow["當期申報地價"]),
    declaredLandValueYear: normalizeCellValue(locationRow.declaredLandValueYear || locationRow["申報地價年度"]),
    sourceType: normalizeCellValue(locationRow.sourceType),
    sourceFilename: normalizeCellValue(locationRow.sourceFilename || locationRow.sourceFile || locationRow.fileName),
    sourcePage: normalizeCellValue(locationRow.sourcePage),
    importedAt,
    updatedAt: normalizeCellValue(locationRow.updatedAt) || importedAt,
    rowStatus: normalizeCellValue(locationRow.rowStatus) || "active",
    notes: normalizeCellValue(locationRow.notes || locationRow.note),
  };
}

function normalizeRosterBuildingRightRow(row, index = 0) {
  const rowId = normalizeCellValue(row?.rowId || row?.buildingRightRowId) || formatSequence("BR", index);
  const importedAt = normalizeCellValue(row?.importedAt);
  const buildingAreaSqm = parseRosterNumber(row?.buildingTotalAreaSqm || row?.buildingAreaSqm || row?.buildingAreaRaw || row?.["建物面積㎡"] || row?.["面積(m2)-合計"]);
  const mainBuildingAreaSqm = parseRosterNumber(row?.mainBuildingAreaSqm || row?.["面積(m2)-主建物"] || row?.["主建物"]);
  const accessoryBuildingAreaSqm = parseRosterNumber(row?.accessoryBuildingAreaSqm || row?.["面積(m2)-附屬建物"] || row?.["附屬建物"]);
  const shareNumerator = normalizeCellValue(row?.shareNumerator || row?.["持分分子"]);
  const shareDenominator = normalizeCellValue(row?.shareDenominator || row?.["持分分母"]);
  const originalShareAreaSqm = pickNumericValue(
    parseRosterNumber(row?.originalShareAreaSqm),
    parseRosterNumber(row?.excelShareAreaSqm),
  );
  const shareAreaQuality = evaluateLandShareArea({
    landAreaSqm: buildingAreaSqm,
    shareNumerator,
    shareDenominator,
    originalShareAreaSqm,
    existingShareAreaSqm: row?.shareAreaSqm,
  });

  return {
    ...row,
    rowId,
    buildingRightRowId: normalizeCellValue(row?.buildingRightRowId) || rowId,
    city: normalizeLandKeyPart(row?.city || row?.["縣市"] || row?.county),
    district: normalizeLandKeyPart(row?.district || row?.["行政區"] || row?.town),
    section: normalizeLandKeyPart(row?.section || row?.["段別"] || row?.["地段"]),
    subsection: normalizeLandKeyPart(row?.subsection || row?.["小段"]),
    lotNumber: normalizeLandKeyPart(row?.lotNumber || row?.landNumber || row?.relatedLandNumber || row?.parcelNumber || row?.["地號"]),
    relatedLandNumber: normalizeLandKeyPart(row?.relatedLandNumber || row?.lotNumber || row?.landNumber || row?.parcelNumber || row?.["地號"]),
    locatedLandNumber: normalizeLandKeyPart(row?.locatedLandNumber || row?.relatedLandNumber || row?.lotNumber || row?.landNumber || row?.parcelNumber || row?.["座落地號"] || row?.["地號"]),
    buildingNumber: normalizeCellValue(row?.buildingNumber || row?.["建號"]),
    standardSchemaVersion: normalizeCellValue(row?.standardSchemaVersion) || ROSTER_STANDARD_SCHEMA_VERSION,
    buildingSequence: normalizeCellValue(row?.buildingSequence || row?.["編號"]),
    buildingDoorplate: normalizeCellValue(row?.buildingDoorplate || row?.buildingAddress || row?.address || row?.["建物門牌號碼"]),
    buildingTotalAreaSqm: Number.isFinite(buildingAreaSqm) ? roundForStorage(buildingAreaSqm, INTERNAL_DECIMAL_DIGITS) : "",
    mainBuildingAreaSqm: Number.isFinite(mainBuildingAreaSqm) ? roundForStorage(mainBuildingAreaSqm, INTERNAL_DECIMAL_DIGITS) : "",
    accessoryBuildingAreaSqm: Number.isFinite(accessoryBuildingAreaSqm) ? roundForStorage(accessoryBuildingAreaSqm, INTERNAL_DECIMAL_DIGITS) : "",
    ownerRegistrationOrder: normalizeCellValue(row?.ownerRegistrationOrder || row?.registrationOrder || row?.["登記次序"]),
    ownerName: normalizeCellValue(row?.ownerName || row?.["所有權人"] || row?.["所有權人(管理人)"]),
    ownerIdNumber: normalizeCellValue(row?.ownerIdNumber || row?.maskedIdentityCode || row?.["身分證字號"]),
    shareNumerator,
    shareDenominator,
    shareDisplay: formatShareText(shareNumerator, shareDenominator, row?.shareText),
    originalShareAreaSqm: Number.isFinite(shareAreaQuality.originalShareAreaSqm) ? shareAreaQuality.originalShareAreaSqm : "",
    calculatedShareAreaSqm: Number.isFinite(shareAreaQuality.calculatedShareAreaSqm) ? shareAreaQuality.calculatedShareAreaSqm : "",
    calculatedShareAreaPing: Number.isFinite(shareAreaQuality.calculatedShareAreaPing) ? shareAreaQuality.calculatedShareAreaPing : "",
    shareAreaSqm: Number.isFinite(shareAreaQuality.shareAreaSqm) ? shareAreaQuality.shareAreaSqm : "",
    shareAreaPing: Number.isFinite(shareAreaQuality.shareAreaPing) ? shareAreaQuality.shareAreaPing : "",
    shareAreaSource: shareAreaQuality.shareAreaSource,
    shareAreaValidationStatus: shareAreaQuality.shareAreaValidationStatus,
    shareAreaDifferenceSqm: Number.isFinite(shareAreaQuality.shareAreaDifferenceSqm) ? shareAreaQuality.shareAreaDifferenceSqm : "",
    shareAreaValidationMessages: shareAreaQuality.shareAreaValidationMessages,
    shareAreaCanCalculate: shareAreaQuality.shareAreaCanCalculate,
    shareAreaWithinTolerance: shareAreaQuality.shareAreaWithinTolerance,
    shareAreaSuspectedColumnMisalignment: shareAreaQuality.shareAreaSuspectedColumnMisalignment,
    otherRightRegistrationOrder: normalizeCellValue(row?.otherRightRegistrationOrder || row?.["他項權利登記次序"]),
    otherRightType: normalizeCellValue(row?.otherRightType || row?.otherRightsType || row?.["權利種類"] || row?.["他項權利種類"]),
    otherRightHolder: normalizeCellValue(row?.otherRightHolder || row?.otherRightsHolder || row?.["他項權利人"]),
    debtor: normalizeCellValue(row?.debtor || row?.["債務人"]),
    debtorAndDebtRatio: normalizeCellValue(row?.debtorAndDebtRatio || row?.["債務人及債務額比例"]),
    obligor: normalizeCellValue(row?.obligor || row?.["設定義務人"]),
    note: normalizeCellValue(row?.note || row?.notes || row?.["備註"]),
    transcriptAddress: normalizeCellValue(row?.transcriptAddress || row?.address || row?.["謄本地址"]),
    floorLevel: normalizeCellValue(row?.floorLevel || row?.["層次"]),
    totalFloors: normalizeCellValue(row?.totalFloors || row?.["總層數"]),
    structureType: normalizeCellValue(row?.structureType || row?.structure || row?.["構造"]),
    completionDate: normalizeCellValue(row?.completionDate || row?.["建築完成日期"]),
    parseStatus: normalizeCellValue(row?.parseStatus) || (shareAreaQuality.shareAreaValidationMessages.length ? "needs-review" : "parsed"),
    validationMessages: Array.isArray(row?.validationMessages)
      ? [...new Set([...row.validationMessages, ...shareAreaQuality.shareAreaValidationMessages])]
      : shareAreaQuality.shareAreaValidationMessages,
    originalFields: row?.originalFields ?? {
      buildingAreaSqm: row?.buildingTotalAreaSqm || row?.buildingAreaSqm || row?.buildingAreaRaw,
      shareNumerator,
      shareDenominator,
      shareAreaSqm: originalShareAreaSqm,
    },
    computedFields: {
      ...(row?.computedFields ?? {}),
      shareRatio: shareAreaQuality.shareRatio,
      shareAreaSqm: shareAreaQuality.calculatedShareAreaSqm,
      shareAreaPing: shareAreaQuality.calculatedShareAreaPing,
    },
    relatedLandIdentityKey: buildLotIdentityKey({
      ...row,
      city: row?.city || row?.["縣市"] || row?.county,
      district: row?.district || row?.["行政區"] || row?.town,
      section: row?.section || row?.["段別"] || row?.["地段"],
      subsection: row?.subsection || row?.["小段"],
      lotNumber: row?.lotNumber || row?.landNumber || row?.relatedLandNumber || row?.parcelNumber || row?.["地號"],
    }),
    landDisplayLabel: getLandDisplayLabel({
      ...row,
      city: row?.city || row?.["縣市"] || row?.county,
      district: row?.district || row?.["行政區"] || row?.town,
      section: row?.section || row?.["段別"] || row?.["地段"],
      subsection: row?.subsection || row?.["小段"],
      lotNumber: row?.lotNumber || row?.landNumber || row?.relatedLandNumber || row?.parcelNumber || row?.["地號"],
    }),
    sourceType: normalizeCellValue(row?.sourceType),
    sourceFilename: normalizeCellValue(row?.sourceFilename || row?.sourceFile || row?.fileName),
    sourcePage: normalizeCellValue(row?.sourcePage),
    importedAt,
    updatedAt: normalizeCellValue(row?.updatedAt) || importedAt,
    rowStatus: normalizeCellValue(row?.rowStatus) || "active",
    notes: normalizeCellValue(row?.notes || row?.note),
  };
}

function normalizeRosterStaging(rosterStaging) {
  if (!isPlainRecord(rosterStaging)) {
    return rosterStaging;
  }

  const sourceLandRows = Array.isArray(rosterStaging.landRights)
    ? rosterStaging.landRights
    : Array.isArray(rosterStaging.landRows)
      ? rosterStaging.landRows
      : [];
  const normalizedLandRows = sourceLandRows.map((row, index) => normalizeRosterLandRightRow(row, index));
  const sourceBuildingRows = Array.isArray(rosterStaging.buildingRights)
    ? rosterStaging.buildingRights
    : Array.isArray(rosterStaging.buildingRows)
      ? rosterStaging.buildingRows
      : [];
  const normalizedBuildingRows = sourceBuildingRows.map((row, index) => normalizeRosterBuildingRightRow(row, index));

  return {
    ...rosterStaging,
    versionHistory: Array.isArray(rosterStaging.versionHistory) ? rosterStaging.versionHistory : [],
    priceUpdateHistory: Array.isArray(rosterStaging.priceUpdateHistory) ? rosterStaging.priceUpdateHistory : [],
    landRights: normalizedLandRows,
    landRows: normalizedLandRows,
    buildingRights: normalizedBuildingRows,
    buildingRows: normalizedBuildingRows,
  };
}

function normalizeRosterStagingByCaseId(rosterStagingByCaseId) {
  if (!isPlainRecord(rosterStagingByCaseId)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rosterStagingByCaseId).map(([caseId, rosterStaging]) => [
      caseId,
      normalizeRosterStaging(rosterStaging),
    ]),
  );
}

function formatShareText(numerator, denominator, fallbackValue = "") {
  const normalizedNumerator = normalizeCellValue(numerator);
  const normalizedDenominator = normalizeCellValue(denominator);

  if (!normalizedNumerator && !normalizedDenominator) {
    return normalizeCellValue(fallbackValue);
  }

  return `${normalizedNumerator || "待補"} / ${normalizedDenominator || "待補"}`;
}

function isMissingSharePart(value) {
  const text = normalizeCellValue(value);
  return !text || text === "/" || text === "／";
}

function buildRosterRowValidationStatus({
  rowType,
  ownerName,
  numberLabel,
  numberValue,
  section,
  shareNumerator,
  shareDenominator,
  baseAreaSqm,
  shareAreaSqm,
  city,
  district,
  relatedLandNumber,
}) {
  const missing = [];
  if (rowType === "land" && !normalizeCellValue(section)) missing.push("地段");
  if (!normalizeCellValue(numberValue)) missing.push(numberLabel);
  if (!normalizeCellValue(ownerName)) missing.push("所有權人");
  if (isMissingSharePart(shareNumerator)) missing.push("權利範圍分子");
  if (isMissingSharePart(shareDenominator)) missing.push("權利範圍分母");
  if (!Number.isFinite(baseAreaSqm) && !Number.isFinite(shareAreaSqm)) {
    missing.push(rowType === "land" ? "土地面積或持分面積" : "建物面積或持分面積");
  }
  if (rowType === "building" && !normalizeCellValue(relatedLandNumber)) {
    missing.push("座落地號");
  }

  if (missing.length) {
    return `待確認：${missing.join("、")}`;
  }

  if (!normalizeCellValue(city) || !normalizeCellValue(district)) {
    return "待補地籍：原檔未提供縣市 / 行政區";
  }

  return "可建立疑似群組";
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

function parseCellReference(cellReference = "") {
  return {
    columnIndex: getColumnIndex(cellReference),
    rowNumber: getRowNumber(cellReference),
  };
}

function parseMergeRanges(xml) {
  return Array.from(xml.getElementsByTagName("mergeCell"))
    .map((mergeCell) => mergeCell.getAttribute("ref") ?? "")
    .map((range) => {
      const [startRef, endRef] = range.split(":");
      const start = parseCellReference(startRef);
      const end = parseCellReference(endRef || startRef);
      return {
        startColumnIndex: Math.min(start.columnIndex, end.columnIndex),
        endColumnIndex: Math.max(start.columnIndex, end.columnIndex),
        startRowNumber: Math.min(start.rowNumber, end.rowNumber),
        endRowNumber: Math.max(start.rowNumber, end.rowNumber),
      };
    })
    .filter((range) => (
      range.startColumnIndex >= 0
      && range.endColumnIndex >= 0
      && range.startRowNumber > 0
      && range.endRowNumber > 0
    ));
}

function fillMergedSheetValues(rows, mergeRanges) {
  if (!mergeRanges.length) {
    return rows;
  }

  const rowsByNumber = new Map(rows.map((row) => [row.excelRowNumber, row]));

  mergeRanges.forEach((range) => {
    const sourceValue = normalizeCellValue(rowsByNumber.get(range.startRowNumber)?.values?.[range.startColumnIndex]);
    if (!sourceValue) {
      return;
    }

    for (let rowNumber = range.startRowNumber; rowNumber <= range.endRowNumber; rowNumber += 1) {
      const row = rowsByNumber.get(rowNumber);
      if (!row) {
        continue;
      }
      for (let columnIndex = range.startColumnIndex; columnIndex <= range.endColumnIndex; columnIndex += 1) {
        if (!normalizeCellValue(row.values[columnIndex])) {
          row.values[columnIndex] = sourceValue;
        }
      }
    }
  });

  return rows;
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
  const rows = Array.from(xml.getElementsByTagName("row")).map((row) => {
    const values = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      values[getColumnIndex(cell.getAttribute("r") ?? "")] = normalizeCellValue(getCellText(cell, sharedStrings));
    });
    return {
      excelRowNumber: Number(row.getAttribute("r")) || getRowNumber(row.getElementsByTagName("c")[0]?.getAttribute("r") ?? ""),
      values,
    };
  });

  return fillMergedSheetValues(rows, parseMergeRanges(xml));
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

  const sheetRowsByName = {};
  for (const [sheetName, sheetPath] of sheets.entries()) {
    sheetRowsByName[sheetName] = parseSheetRows(await readZipText(entries, sheetPath), sharedStrings);
  }

  const sheetSelection = selectRosterSheets(sheetRowsByName);
  const mappingResult = buildRosterWorkbookMappingResult(sheetSelection);

  return {
    availableSheets: Array.from(sheets.keys()),
    sheetSelection,
    landRows: mappingResult.landRows,
    buildingRows: mappingResult.buildingRows,
    columnMappingSummary: mappingResult.columnMappingSummary,
    columnMappingWarnings: mappingResult.columnMappingWarnings,
    needsColumnMapping: mappingResult.needsColumnMapping,
    integrationFound: sheets.has(rosterImportSheets.integration),
    allocationFound: sheets.has(rosterImportSheets.allocation),
  };
}

function buildRosterWorkbookDataFromMapping(workbookData, mappingOverrides) {
  const mappingResult = buildRosterWorkbookMappingResult(workbookData.sheetSelection, mappingOverrides);
  return {
    ...workbookData,
    landRows: mappingResult.landRows,
    buildingRows: mappingResult.buildingRows,
    columnMappingSummary: mappingResult.columnMappingSummary,
    columnMappingWarnings: mappingResult.columnMappingWarnings,
    needsColumnMapping: false,
  };
}

function buildLandRightRows(rows, sourceContext = {}) {
  const mappedRows = rows.map((row) => {
    const landAreaRaw = getMappedRosterValue(row, ["landAreaSqm"], ["土地面積㎡", "土地面積"], ["土地面積", "面積"]);
    const landAreaSqm = parseRosterNumber(landAreaRaw);
    const excelLandAreaPing = getFirstExactHeaderValue(row, ["土地面積坪"]);
    const shareNumerator = getMappedRosterValue(row, ["shareNumerator"], ["持分分子"]);
    const shareDenominator = getMappedRosterValue(row, ["shareDenominator"], ["持分分母"]);
    const excelShareRatio = getFirstExactHeaderValue(row, ["持分比例"]);
    const excelShareAreaPing = getFirstExactHeaderValue(row, ["持分面積坪"]);
    const excelShareAreaSqm = getMappedRosterValue(
      row,
      ["originalShareAreaSqm", "excelShareAreaSqm", "shareAreaSqm"],
      ["土地持分面積㎡", "持分面積㎡"],
    );
    const calculatedShareRatio = parseRatio(shareNumerator, shareDenominator);
    const shareAreaQuality = evaluateLandShareArea({
      landAreaSqm,
      shareNumerator,
      shareDenominator,
      originalShareAreaSqm: excelShareAreaSqm,
      existingShareAreaSqm: row.shareAreaSqm,
    });
    const calculatedShareAreaSqm = shareAreaQuality.calculatedShareAreaSqm;
    const ownerName = getFirstMatchingValue(row, ["地主姓名", "所有權人", "姓名", "名稱"]);
    const city = getRosterFieldValue(row, rosterImportFieldAliases.city);
    const district = getRosterFieldValue(row, rosterImportFieldAliases.district);
    const section = getRosterFieldValue(row, rosterImportFieldAliases.section);
    const subsection = getRosterFieldValue(row, rosterImportFieldAliases.subsection);
    const lotNumber = getRosterFieldValue(row, rosterImportFieldAliases.lotNumber, ["地號", "lotNo", "lotNumber"]);
    const landNumber = lotNumber;
    const announcedCurrentValue = getHeaderValue(row, ["公告土地現值", "公告現值"], ["公告土地現值", "公告現值"]);
    const declaredLandValue = getHeaderValue(row, ["申報地價", "當期申報地價"], ["申報地價", "當期申報地價"]);
    const registrationOrder = getHeaderValue(row, ["登記次序"], ["登記次序"]);
    const landSequence = getHeaderValue(row, ["序號"], ["序號"]);
    const ownerRegistrationOrder = getHeaderValue(row, ["所有權部登記次序", "登記次序"], ["登記次序"]);
    const otherRightRegistrationOrder = getHeaderValue(row, ["他項權利登記次序"], ["他項權利登記次序", "他項登記次序"]);
    const registeredOwnerName = getHeaderValue(row, ["登記名義人", "所有權人"], ["登記名義人", "所有權人"]);
    const trusteeName = getHeaderValue(row, ["受託人"], ["受託人"]);
    const trustorName = getHeaderValue(row, ["委託人", "實際權利人"], ["委託人", "實際權利人"]);
    const ownershipType = getHeaderValue(row, ["權利型態"], ["信託", "權利型態"]);
    const ownerIdNumber = getFirstMatchingValue(row, ["身分證", "統編", "統一編號", "證號", "識別碼", "前碼"]);
    const otherRightType = getMappedRosterValue(row, ["otherRightType", "otherRightsType"], ["他項權利種類", "權利種類"], ["他項權利種類", "權利種類"]);
    const otherRightHolder = getMappedRosterValue(row, ["otherRightHolder", "otherRightsHolder"], ["他項權利人"], ["他項權利人"]);
    const debtor = getMappedRosterValue(row, ["debtor"], ["債務人"], ["債務人"]);
    const debtorAndDebtRatio = getMappedRosterValue(row, ["debtorAndDebtRatio"], ["債務人及債務額比例"], ["債務人及債務額比例", "債務額比例"]);
    const obligor = getMappedRosterValue(row, ["obligor"], ["設定義務人"], ["設定義務人", "義務人"]);
    const securedAmount = getMappedRosterValue(row, ["securedAmount", "amount"], ["金額"], ["金額", "債權額", "擔保債權"]);
    const note = getMappedRosterValue(row, ["note", "notes"], ["備註"], ["備註", "說明"]);
    const transcriptAddress = getMappedRosterValue(row, ["transcriptAddress"], ["謄本地址"], ["謄本地址", "地址", "通訊地址", "戶籍地址", "住址"]);

    return {
      sourceRowNumber: row.__rowNumber,
      ownerReferenceId: getFirstMatchingValue(row, ["地主編號", "權利人編號", "所有權人編號", "參考編號"]),
      ownerName,
      registrationOrder,
      landSequence,
      sectionName: section,
      ownerRegistrationOrder,
      registeredOwnerName,
      trusteeName,
      trustorName,
      ownershipType,
      maskedIdentityCode: ownerIdNumber,
      ownerIdNumber,
      address: transcriptAddress,
      transcriptAddress,
      city,
      district,
      section,
      subsection,
      lotNumber,
      landNumber,
      landAreaRaw,
      landAreaSqm: roundForStorage(landAreaSqm, INTERNAL_DECIMAL_DIGITS),
      excelLandAreaPing,
      shareNumerator,
      shareDenominator,
      excelShareRatio,
      excelShareAreaSqm,
      excelShareAreaPing,
      calculatedShareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
      standardSchemaVersion: ROSTER_STANDARD_SCHEMA_VERSION,
      originalShareAreaSqm: Number.isFinite(shareAreaQuality.originalShareAreaSqm) ? shareAreaQuality.originalShareAreaSqm : "",
      calculatedShareAreaSqm,
      calculatedShareAreaPing: shareAreaQuality.calculatedShareAreaPing,
      shareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
      shareAreaSqm: shareAreaQuality.shareAreaSqm,
      shareAreaPing: shareAreaQuality.shareAreaPing,
      shareAreaSource: shareAreaQuality.shareAreaSource,
      shareAreaValidationStatus: shareAreaQuality.shareAreaValidationStatus,
      shareAreaDifferenceSqm: Number.isFinite(shareAreaQuality.shareAreaDifferenceSqm) ? shareAreaQuality.shareAreaDifferenceSqm : "",
      shareAreaValidationMessages: shareAreaQuality.shareAreaValidationMessages,
      shareAreaCanCalculate: shareAreaQuality.shareAreaCanCalculate,
      shareAreaWithinTolerance: shareAreaQuality.shareAreaWithinTolerance,
      shareAreaSuspectedColumnMisalignment: shareAreaQuality.shareAreaSuspectedColumnMisalignment,
      landArea: getFirstMatchingValue(row, ["土地面積", "面積"]),
      announcedCurrentValue,
      announcedCurrentValueYear: getHeaderValue(row, ["公告現值年度", "公告土地現值年度"], ["公告現值年度", "公告土地現值年度"]),
      declaredLandValue,
      declaredLandValueYear: getHeaderValue(row, ["申報地價年度"], ["申報地價年度"]),
      announcedLandValue: getFirstMatchingValue(row, ["公告地價"]),
      shareText: getFirstMatchingValue(row, ["權利範圍", "持分"]),
      shareDisplay: formatShareText(shareNumerator, shareDenominator, getFirstMatchingValue(row, ["權利範圍", "持分"])),
      convertedShare: getFirstMatchingValue(row, ["換算持分", "持分比例", "持分面積"]),
      contactStatus: getFirstMatchingValue(row, ["聯絡狀態", "聯絡"]),
      consentStatus: getFirstMatchingValue(row, ["同意狀態", "同意"]),
      contractStatus: getFirstMatchingValue(row, ["簽約狀態", "簽約"]),
      otherRightRegistrationOrder,
      otherRightType,
      otherRightsType: otherRightType,
      otherRightsHolder: otherRightHolder,
      otherRightHolder,
      debtor,
      debtorAndDebtRatio,
      obligor,
      securedAmount,
      note,
      notes: [
        note,
        otherRightType,
        otherRightHolder,
      ].filter(Boolean).join("；"),
      parseStatus: shareAreaQuality.shareAreaValidationMessages.length ? "needs-review" : "parsed",
      validationMessages: shareAreaQuality.shareAreaValidationMessages,
      sourceSheetName: row.__sheetName || sourceContext.sourceSheetName || "",
      originalFields: {
        landAreaSqm: landAreaRaw,
        shareNumerator,
        shareDenominator,
        shareAreaSqm: excelShareAreaSqm,
      },
      computedFields: {
        shareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
        shareAreaSqm: shareAreaQuality.calculatedShareAreaSqm,
        shareAreaPing: shareAreaQuality.calculatedShareAreaPing,
      },
      sourceType: sourceContext.sourceType || "",
      sourceFilename: sourceContext.sourceFilename || "",
      sourcePage: "",
      importedAt: sourceContext.importedAt || "",
      updatedAt: sourceContext.updatedAt || sourceContext.importedAt || "",
      rowStatus: "active",
      validationStatus: buildRosterRowValidationStatus({
        rowType: "land",
        ownerName,
        numberLabel: "地號",
        numberValue: landNumber,
        section,
        shareNumerator,
        shareDenominator,
        baseAreaSqm: landAreaSqm,
        shareAreaSqm: shareAreaQuality.shareAreaSqm,
        city,
        district,
      }),
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
      rowId: formatSequence("LR", index),
      landRightRowId: formatSequence("LR", index),
    }));
}

function buildBuildingRightRows(rows, sourceContext = {}) {
  const mappedRows = rows.map((row) => {
    const buildingAreaRaw = getMappedRosterValue(row, ["buildingTotalAreaSqm", "buildingAreaSqm"], ["建物面積㎡", "建物面積"], ["建物面積", "面積"]);
    const buildingAreaSqm = parseRosterNumber(buildingAreaRaw);
    const excelBuildingAreaPing = getFirstExactHeaderValue(row, ["建物面積坪"]);
    const shareNumerator = getMappedRosterValue(row, ["shareNumerator"], ["持分分子"]);
    const shareDenominator = getMappedRosterValue(row, ["shareDenominator"], ["持分分母"]);
    const excelShareRatio = getFirstExactHeaderValue(row, ["持分比例"]);
    const excelShareAreaSqm = getMappedRosterValue(
      row,
      ["originalShareAreaSqm", "excelShareAreaSqm", "shareAreaSqm"],
      ["建物持分面積㎡", "持分面積㎡"],
    );
    const calculatedShareRatio = parseRatio(shareNumerator, shareDenominator);
    const shareAreaQuality = evaluateLandShareArea({
      landAreaSqm: buildingAreaSqm,
      shareNumerator,
      shareDenominator,
      originalShareAreaSqm: excelShareAreaSqm,
      existingShareAreaSqm: row.shareAreaSqm,
    });
    const calculatedShareAreaSqm = shareAreaQuality.calculatedShareAreaSqm;
    const ownerName = getFirstMatchingValue(row, ["地主姓名", "所有權人", "姓名", "名稱"]);
    const buildingNumber = getFirstMatchingValue(row, ["建號"]);
    const city = getRosterFieldValue(row, rosterImportFieldAliases.city);
    const district = getRosterFieldValue(row, rosterImportFieldAliases.district);
    const section = getRosterFieldValue(row, rosterImportFieldAliases.section);
    const subsection = getRosterFieldValue(row, rosterImportFieldAliases.subsection);
    const lotNumber = getRosterFieldValue(row, rosterImportFieldAliases.lotNumber, ["對應地號", "地號", "lotNo", "lotNumber"]);
    const buildingSequence = getHeaderValue(row, ["編號"], ["編號"]);
    const ownerRegistrationOrder = getHeaderValue(row, ["所有權部登記次序", "登記次序"], ["登記次序"]);
    const otherRightRegistrationOrder = getHeaderValue(row, ["他項權利登記次序"], ["他項權利登記次序", "他項登記次序"]);
    const ownerIdNumber = getFirstMatchingValue(row, ["身分證", "統編", "統一編號", "證號", "識別碼", "前碼"]);
    const otherRightType = getMappedRosterValue(row, ["otherRightType", "otherRightsType"], ["他項權利種類", "權利種類"], ["他項權利種類", "權利種類"]);
    const otherRightHolder = getMappedRosterValue(row, ["otherRightHolder", "otherRightsHolder"], ["他項權利人"], ["他項權利人"]);
    const debtor = getMappedRosterValue(row, ["debtor"], ["債務人"], ["債務人"]);
    const debtorAndDebtRatio = getMappedRosterValue(row, ["debtorAndDebtRatio"], ["債務人及債務額比例"], ["債務人及債務額比例", "債務額比例"]);
    const obligor = getMappedRosterValue(row, ["obligor"], ["設定義務人"], ["設定義務人", "義務人"]);
    const note = getMappedRosterValue(row, ["note", "notes"], ["備註"], ["備註", "說明"]);
    const transcriptAddress = getMappedRosterValue(row, ["transcriptAddress"], ["謄本地址"], ["謄本地址", "地址", "通訊地址", "戶籍地址", "住址"]);
    const buildingDoorplate = getFirstMatchingValue(row, ["建物門牌號碼", "建物門牌", "門牌"]);
    const mainBuildingAreaSqm = roundForStorage(parseRosterNumber(getFirstExactHeaderValue(row, ["主建物面積㎡"])), INTERNAL_DECIMAL_DIGITS);
    const accessoryBuildingAreaSqm = roundForStorage(parseRosterNumber(getFirstExactHeaderValue(row, ["附屬建物面積㎡"])), INTERNAL_DECIMAL_DIGITS);
    const structureType = getFirstMatchingValue(row, ["構造", "構造種類"]);

    return {
      sourceRowNumber: row.__rowNumber,
      ownerReferenceId: getFirstMatchingValue(row, ["地主編號", "權利人編號", "所有權人編號", "參考編號"]),
      buildingSequence,
      ownerName,
      ownerRegistrationOrder,
      maskedIdentityCode: ownerIdNumber,
      ownerIdNumber,
      city,
      district,
      section,
      subsection,
      lotNumber,
      relatedLandNumber: lotNumber,
      locatedLandNumber: lotNumber,
      buildingNumber,
      address: buildingDoorplate || transcriptAddress,
      transcriptAddress,
      buildingAddress: buildingDoorplate,
      buildingDoorplate,
      buildingAreaRaw,
      buildingAreaSqm: roundForStorage(buildingAreaSqm, INTERNAL_DECIMAL_DIGITS),
      buildingTotalAreaSqm: roundForStorage(buildingAreaSqm, INTERNAL_DECIMAL_DIGITS),
      mainBuildingAreaSqm,
      accessoryBuildingAreaSqm,
      excelBuildingAreaPing,
      shareNumerator,
      shareDenominator,
      excelShareRatio,
      excelShareAreaSqm,
      calculatedShareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
      standardSchemaVersion: ROSTER_STANDARD_SCHEMA_VERSION,
      originalShareAreaSqm: Number.isFinite(shareAreaQuality.originalShareAreaSqm) ? shareAreaQuality.originalShareAreaSqm : "",
      calculatedShareAreaSqm,
      calculatedShareAreaPing: shareAreaQuality.calculatedShareAreaPing,
      shareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
      shareAreaSqm: shareAreaQuality.shareAreaSqm,
      shareAreaPing: shareAreaQuality.shareAreaPing,
      shareAreaSource: shareAreaQuality.shareAreaSource,
      shareAreaValidationStatus: shareAreaQuality.shareAreaValidationStatus,
      shareAreaDifferenceSqm: Number.isFinite(shareAreaQuality.shareAreaDifferenceSqm) ? shareAreaQuality.shareAreaDifferenceSqm : "",
      shareAreaValidationMessages: shareAreaQuality.shareAreaValidationMessages,
      shareAreaCanCalculate: shareAreaQuality.shareAreaCanCalculate,
      shareAreaWithinTolerance: shareAreaQuality.shareAreaWithinTolerance,
      shareAreaSuspectedColumnMisalignment: shareAreaQuality.shareAreaSuspectedColumnMisalignment,
      buildingArea: getFirstMatchingValue(row, ["建物面積", "面積"]),
      shareText: getFirstMatchingValue(row, ["權利範圍", "持分"]),
      shareDisplay: formatShareText(shareNumerator, shareDenominator, getFirstMatchingValue(row, ["權利範圍", "持分"])),
      floorLevel: getFirstMatchingValue(row, ["層次", "樓層"]),
      totalFloors: getFirstMatchingValue(row, ["總層數", "總樓層"]),
      structure: structureType,
      structureType,
      completionDate: getFirstMatchingValue(row, ["建築完成日期", "完工日期", "建築日期"]),
      otherRightRegistrationOrder,
      otherRightType,
      otherRightsType: otherRightType,
      otherRightsHolder: otherRightHolder,
      otherRightHolder,
      debtor,
      debtorAndDebtRatio,
      obligor,
      note,
      notes: [
        note,
        otherRightType,
        otherRightHolder,
      ].filter(Boolean).join("；"),
      parseStatus: shareAreaQuality.shareAreaValidationMessages.length ? "needs-review" : "parsed",
      validationMessages: shareAreaQuality.shareAreaValidationMessages,
      sourceSheetName: row.__sheetName || sourceContext.sourceSheetName || "",
      originalFields: {
        buildingAreaSqm: buildingAreaRaw,
        shareNumerator,
        shareDenominator,
        shareAreaSqm: excelShareAreaSqm,
      },
      computedFields: {
        shareRatio: roundForStorage(calculatedShareRatio, INTERNAL_DECIMAL_DIGITS),
        shareAreaSqm: shareAreaQuality.calculatedShareAreaSqm,
        shareAreaPing: shareAreaQuality.calculatedShareAreaPing,
      },
      sourceType: sourceContext.sourceType || "",
      sourceFilename: sourceContext.sourceFilename || "",
      sourcePage: "",
      importedAt: sourceContext.importedAt || "",
      updatedAt: sourceContext.updatedAt || sourceContext.importedAt || "",
      rowStatus: "active",
      validationStatus: buildRosterRowValidationStatus({
        rowType: "building",
        ownerName,
        numberLabel: "建號",
        numberValue: buildingNumber,
        section,
        shareNumerator,
        shareDenominator,
        baseAreaSqm: buildingAreaSqm,
        shareAreaSqm: shareAreaQuality.shareAreaSqm,
        city,
        district,
        relatedLandNumber: lotNumber,
      }),
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
      rowId: formatSequence("BR", index),
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
  const landIdentityKeys = new Set(landRights.map((row) => buildLotIdentityKey(row)).filter(Boolean));
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
      if (buildLotIdentityKey(row)) nameGroup.landNumbers.add(getLandDisplayLabel(row));
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
      if (buildLotIdentityKey(row)) group.landNumbers.add(getLandDisplayLabel(row));
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
    if (row.relatedLandNumber && !landIdentityKeys.has(buildLotIdentityKey(row))) {
      issues.push(createRosterIssue("建物地籍未匹配", "中", "建物對應地籍定位未出現在土地清冊，請確認縣市、行政區、段別、小段與地號。", [row.buildingRightRowId]));
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
  const sharesByLandIdentity = new Map();

  landRights.forEach((row) => {
    const landIdentityKey = buildLotIdentityKey(row);
    const shareRatio = parseRatio(row.shareNumerator, row.shareDenominator);

    if (!landIdentityKey || !Number.isFinite(shareRatio)) {
      return;
    }

    const group = sharesByLandIdentity.get(landIdentityKey) ?? {
      landDisplayLabel: getLandDisplayLabel(row),
      totalShareRatio: 0,
      rowIds: [],
    };

    group.totalShareRatio += shareRatio;
    group.rowIds.push(row.landRightRowId);
    sharesByLandIdentity.set(landIdentityKey, group);
  });

  return Array.from(sharesByLandIdentity.values()).flatMap((group) => {
    const difference = Math.abs(group.totalShareRatio - 1);

    if (difference <= SHARE_TOTAL_TOLERANCE) {
      return [];
    }

    return createRosterIssue(
      "地號持分合計待確認",
      "中",
      `地籍「${group.landDisplayLabel}」持分合計為 ${formatNumber(group.totalShareRatio, 6)}，與 1 的差距超過 ${SHARE_TOTAL_TOLERANCE}，請人工確認原始分子 / 分母。`,
      group.rowIds.filter(Boolean),
    );
  });
}

function countLandIdentityFallbackRows(landRows) {
  return landRows.filter((row) => {
    const identity = buildLandIdentity(row);
    return identity.hasFallbackRisk || identity.hasPartialLocation;
  }).length;
}

function buildMissingCadastralLocationIssues(landRows) {
  const affectedRows = landRows
    .filter((row) => !normalizeCellValue(row.city) || !normalizeCellValue(row.district))
    .map((row) => row.landRightRowId)
    .filter(Boolean);

  if (!affectedRows.length) {
    return [];
  }

  return [
    createRosterIssue(
      "原檔未提供縣市行政區",
      "低",
      "此清冊未提供縣市 / 行政區欄位，系統先保留空值，不影響預覽；若需完整地籍 key，請於基地或清冊資料中補齊。",
      affectedRows.slice(0, 20),
    ),
  ];
}

function buildShareAreaQualityIssues(landRows) {
  const affectedRows = landRows
    .filter((row) => Array.isArray(row.shareAreaValidationMessages) && row.shareAreaValidationMessages.length)
    .map((row) => row.landRightRowId)
    .filter(Boolean);

  if (!affectedRows.length) {
    return [];
  }

  return [
    createRosterIssue(
      "持分面積需確認",
      "高",
      "部分持分面積與土地面積、權利範圍驗算不一致，請確認欄位對應或原始資料。",
      affectedRows.slice(0, 20),
    ),
  ];
}

function getRosterPreviewShareAreaMessage(rosterPreview, fallbackMessage = "") {
  const summary = rosterPreview?.summary ?? {};

  if (summary.shareAreaWarningRows > 0) {
    return "部分持分面積與土地面積、權利範圍驗算不一致，請確認欄位對應或原始資料。";
  }

  if (summary.landCount > 0) {
    return "清冊欄位與持分面積檢核通過，請確認預覽後再寫入案件。";
  }

  return fallbackMessage;
}

function buildRosterPreview(file, workbookData) {
  const importedAt = new Date().toLocaleString("zh-TW", { hour12: false });
  const sourceContext = {
    sourceType: workbookData.needsColumnMapping ? "xlsx-column-mapped-review" : "xlsx-column-mapped",
    sourceFilename: file.name,
    importedAt,
    updatedAt: importedAt,
  };
  const landRights = buildLandRightRows(workbookData.landRows, sourceContext);
  const buildingRights = buildBuildingRightRows(workbookData.buildingRows, sourceContext);
  const { partyRows, issues: partyIssues } = buildPartyPreview(landRights, buildingRights);
  const shareTotalIssues = buildLandShareTotalIssues(landRights);
  const locationIssues = buildMissingCadastralLocationIssues(landRights);
  const shareAreaIssues = buildShareAreaQualityIssues(landRights);
  const issues = [...partyIssues, ...shareTotalIssues, ...locationIssues, ...shareAreaIssues];
  const landNumbers = new Set(landRights.map((row) => buildLotIdentityKey(row)).filter(Boolean));
  const buildingNumbers = new Set(buildingRights.map((row) => row.buildingNumber).filter(Boolean));
  const fallbackLandIdentityCount = countLandIdentityFallbackRows(landRights);
  const batchId = `IMPORT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`;
  const rosterSummary = buildRosterBaseSummary({ landRights, landRows: landRights, buildingRights, buildingRows: buildingRights });
  const shareAreaQualitySummary = buildShareAreaQualitySummary(landRights);
  const otherRightsRowCount = [...landRights, ...buildingRights].filter((row) => (
    normalizeCellValue(row.otherRightType || row.otherRightsType)
      || normalizeCellValue(row.otherRightHolder || row.otherRightsHolder)
      || normalizeCellValue(row.debtor)
      || normalizeCellValue(row.obligor)
  )).length;

  return {
    batchId,
    importBatchId: batchId,
    version: "TEMP-V001",
    fileName: file.name,
    importedAt,
    sourceType: sourceContext.sourceType,
    sourceRecords: [
      {
        sourceType: sourceContext.sourceType,
        sourceFilename: file.name,
        importedAt,
        action: "draft-preview",
      },
    ],
    changeLog: [
      {
        action: "draft-preview",
        sourceFilename: file.name,
        createdAt: importedAt,
      },
    ],
    availableSheets: workbookData.availableSheets,
    columnMappingSummary: workbookData.columnMappingSummary ?? null,
    columnMappingWarnings: workbookData.columnMappingWarnings ?? [],
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
      fallbackLandIdentityCount,
      ...shareAreaQualitySummary,
      otherRightsRowCount,
      cadastralLocationDisplay: rosterSummary.cadastralLocationDisplay,
      sameNameMultiLandCount: partyRows.filter((party) => party.landNumbers.length > 1).length,
      sameNameMultiBuildingCount: partyRows.filter((party) => party.buildingNumbers.length > 1).length,
      manualReviewCount: partyRows.filter((party) => !["已人工確認", "已完整資料確認"].includes(party.status)).length + issues.length,
      warningCount: issues.length,
    },
  };
}

function buildRosterPreviewFromPdfResult(parserResult) {
  const importedAt = parserResult.importedAt || new Date().toLocaleString("zh-TW", { hour12: false });
  const landRights = parserResult.landRights.map((row, index) => ({
    ...normalizeRosterLandRightRow({
      ...row,
      sourceType: "readable-pdf",
      importedAt,
      updatedAt: row.updatedAt || importedAt,
      rowStatus: row.rowStatus || "draft",
    }, index),
    rowStatus: row.rowStatus || "draft",
  }));
  const buildingRights = (parserResult.buildingRights ?? []).map((row, index) => normalizeRosterBuildingRightRow({
    ...row,
    sourceType: "readable-pdf",
    importedAt,
    updatedAt: row.updatedAt || importedAt,
    rowStatus: row.rowStatus || "draft",
  }, index));
  const { partyRows, issues: partyIssues } = buildPartyPreview(landRights, buildingRights);
  const shareTotalIssues = buildLandShareTotalIssues(landRights);
  const parserIssues = (parserResult.issues ?? []).map((issue, index) => ({
    id: issue.id || `pdf-parser-${index}`,
    type: issue.type || "PDF 解析提示",
    severity: issue.severity || "中",
    message: issue.message || "PDF 解析結果需人工確認。",
    rows: issue.rows ?? [],
  }));
  const issues = [...parserIssues, ...partyIssues, ...shareTotalIssues];
  const landNumbers = new Set(landRights.map((row) => buildLotIdentityKey(row)).filter(Boolean));
  const buildingNumbers = new Set(buildingRights.map((row) => row.buildingNumber).filter(Boolean));
  const batchId = `PDF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`;
  const rosterSummary = buildRosterBaseSummary({ landRights, landRows: landRights, buildingRights, buildingRows: buildingRights });

  return {
    batchId,
    importBatchId: batchId,
    version: "PDF-DRAFT-V001",
    fileName: parserResult.sourceFiles.join(" + "),
    importedAt,
    sourceType: "readable-pdf",
    sourceRecords: parserResult.sources.map((source) => ({
      sourceType: "readable-pdf",
      sourceFilename: source.sourceFilename,
      importedAt,
      action: "pdf-draft-preview",
      pageCount: source.pageCount,
      textCharCount: source.textCharCount,
      parcelCount: source.parcelCount,
      landRightCount: source.landRightCount,
    })),
    changeLog: [
      {
        action: "pdf-draft-preview",
        sourceFilename: parserResult.sourceFiles.join(" + "),
        createdAt: importedAt,
      },
    ],
    availableSheets: [],
    integrationFound: false,
    allocationFound: false,
    parcels: parserResult.parcels,
    mortgages: parserResult.mortgages,
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
      cadastralLocationDisplay: rosterSummary.cadastralLocationDisplay,
      sameNameMultiLandCount: partyRows.filter((party) => party.landNumbers.length > 1).length,
      sameNameMultiBuildingCount: partyRows.filter((party) => party.buildingNumbers.length > 1).length,
      manualReviewCount: partyRows.filter((party) => !["已人工確認", "已完整資料確認"].includes(party.status)).length + issues.length,
      warningCount: issues.length,
    },
  };
}

function buildGeneratedRosterFileName(currentCase, extension = "xlsx") {
  const caseLabel = normalizeCellValue(currentCase?.code || currentCase?.id || "CASE")
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-");
  const timestamp = new Date().toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace("T", "")
    .slice(0, 12);

  return `sanze-roster-generated-${caseLabel}-${timestamp}.${extension}`;
}

function buildCurrentRosterFileName(currentCase) {
  const caseLabel = normalizeCellValue(currentCase?.code || currentCase?.id || "CASE")
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-");
  const timestamp = new Date().toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace("T", "-")
    .slice(0, 13);

  return `sanze-roster-current-${caseLabel}-${timestamp}.xlsx`;
}

function RosterColumnMappingSection({ title, sheetAnalysis, mapping, onMappingChange }) {
  if (!sheetAnalysis) {
    return (
      <section className="eval-roster-column-section">
        <h5>{title}</h5>
        <p className="eval-roster-column-hint">這份檔案沒有找到可辨識的{title}工作表。</p>
      </section>
    );
  }

  const fields = getRosterColumnFieldList(sheetAnalysis.sheetType);
  const requiredFieldIds = new Set(getRosterColumnRequiredFieldIds(sheetAnalysis.sheetType));
  const orderedFields = [
    ...fields.filter((field) => requiredFieldIds.has(field.id)),
    ...fields.filter((field) => !requiredFieldIds.has(field.id)),
  ];

  return (
    <section className="eval-roster-column-section">
      <div className="eval-roster-column-section-head">
        <h5>{title}</h5>
        <p>
          來源工作表：{sheetAnalysis.name}。請確認欄位對應正確，確認後只會建立預覽。
        </p>
      </div>
      <div className="eval-roster-column-grid">
        {orderedFields.map((field) => (
          <label className="eval-roster-column-field" key={field.id}>
            <span>
              {field.label}
              {requiredFieldIds.has(field.id) && <b>必要</b>}
            </span>
            <select
              value={mapping[field.id] ?? ""}
              onChange={(event) => onMappingChange(sheetAnalysis.sheetType, field.id, event.target.value)}
            >
              <option value="">不使用 / 尚未對應</option>
              {sheetAnalysis.columns
                .filter((column) => column.label)
                .map((column) => (
                  <option value={column.columnIndex} key={`${field.id}-${column.columnIndex}`}>
                    {column.optionLabel}
                  </option>
                ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

function RosterColumnMappingModal({ mappingDraft, onCancel, onReselect, onBuildPreview }) {
  const [mappingByType, setMappingByType] = useState(() => ({
    land: { ...(mappingDraft?.workbookData?.sheetSelection?.land?.mapping ?? {}) },
    building: { ...(mappingDraft?.workbookData?.sheetSelection?.building?.mapping ?? {}) },
  }));
  const [mappingError, setMappingError] = useState("");

  if (!mappingDraft) {
    return null;
  }

  const { workbookData } = mappingDraft;
  const fieldGroups = getRosterColumnFieldGroups();
  const landMissing = workbookData.sheetSelection.land
    ? getMissingRosterRequiredFields(mappingByType.land, "land")
    : fieldGroups.land.requiredFieldIds;
  const buildingMissing = workbookData.sheetSelection.building
    ? getMissingRosterRequiredFields(mappingByType.building, "building")
    : [];

  const handleMappingChange = (sheetType, fieldId, value) => {
    setMappingError("");
    setMappingByType((current) => ({
      ...current,
      [sheetType]: {
        ...current[sheetType],
        [fieldId]: value === "" ? "" : Number(value),
      },
    }));
  };

  const handleBuildPreview = () => {
    const nextLandMissing = workbookData.sheetSelection.land
      ? getMissingRosterRequiredFields(mappingByType.land, "land")
      : fieldGroups.land.requiredFieldIds;
    const nextBuildingMissing = workbookData.sheetSelection.building
      ? getMissingRosterRequiredFields(mappingByType.building, "building")
      : [];

    if (nextLandMissing.length || nextBuildingMissing.length) {
      const missingLabels = [
        ...nextLandMissing.map((fieldId) => `土地 ${getRosterColumnFieldList("land").find((field) => field.id === fieldId)?.label ?? fieldId}`),
        ...nextBuildingMissing.map((fieldId) => `建物 ${getRosterColumnFieldList("building").find((field) => field.id === fieldId)?.label ?? fieldId}`),
      ];
      setMappingError(`尚有必要欄位未對應：${missingLabels.join("、")}`);
      return;
    }

    onBuildPreview(mappingByType);
  };

  return (
    <div className="eval-confirm-backdrop" role="presentation">
      <section className="eval-confirm-dialog eval-roster-column-dialog" role="dialog" aria-modal="true" aria-labelledby="roster-column-mapping-title">
        <h4 id="roster-column-mapping-title">確認清冊欄位對應</h4>
        <p>
          系統已讀取檔案內容，請確認必要欄位是否對應正確。確認後會先建立預覽，不會直接寫入案件資料。
        </p>
        <div className="eval-roster-column-summary">
          <span>檔案：{mappingDraft.fileName}</span>
          <span>土地欄位信心：{workbookData.sheetSelection.land ? `${Math.round(workbookData.sheetSelection.land.confidence * 100)}%` : "未找到"}</span>
          <span>建物欄位信心：{workbookData.sheetSelection.building ? `${Math.round(workbookData.sheetSelection.building.confidence * 100)}%` : "未找到"}</span>
        </div>
        <RosterColumnMappingSection
          title="土地清冊欄位對應"
          sheetAnalysis={workbookData.sheetSelection.land}
          mapping={mappingByType.land}
          onMappingChange={handleMappingChange}
        />
        <RosterColumnMappingSection
          title="建物清冊欄位對應"
          sheetAnalysis={workbookData.sheetSelection.building}
          mapping={mappingByType.building}
          onMappingChange={handleMappingChange}
        />
        {mappingError && <p className="eval-inline-error">{mappingError}</p>}
        <div className="eval-confirm-actions">
          <button type="button" onClick={onCancel}>取消</button>
          <button type="button" onClick={onReselect}>重新選檔</button>
          <button type="button" onClick={handleBuildPreview}>建立預覽</button>
        </div>
      </section>
    </div>
  );
}

function createEmptyRosterRecord(sourceLabel = "manual") {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });

  return {
    batchId: `MANUAL-${Date.now()}`,
    importBatchId: `MANUAL-${Date.now()}`,
    version: "MANUAL-V001",
    fileName: sourceLabel,
    importedAt: now,
    sourceType: sourceLabel,
    sourceRecords: [],
    changeLog: [],
    versionHistory: [],
    priceUpdateHistory: [],
    availableSheets: [],
    integrationFound: false,
    allocationFound: false,
    landRights: [],
    landRows: [],
    buildingRights: [],
    buildingRows: [],
    partyRows: [],
    partyGroups: [],
    issues: [],
    summary: {
      landCount: 0,
      buildingCount: 0,
      partyCount: 0,
      landNumberCount: 0,
      buildingNumberCount: 0,
      manualReviewCount: 0,
      warningCount: 0,
    },
  };
}

function nextRosterSequenceId(rows, prefix) {
  const maxNumber = rows.reduce((max, row) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`, "i").exec(normalizeCellValue(row.rowId || row.landRightRowId || row.buildingRightRowId));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${String(maxNumber + 1).padStart(4, "0")}`;
}

function createRosterVersionSnapshot(rosterStaging, reason) {
  const normalized = normalizeRosterStaging(rosterStaging) || createEmptyRosterRecord();
  const createdAt = new Date().toLocaleString("zh-TW", { hour12: false });

  return {
    versionId: `RV-${Date.now()}`,
    createdAt,
    reason,
    action: "snapshot",
    sourceFilename: normalized.fileName || "",
    fileName: normalized.fileName || "",
    importedAt: normalized.importedAt || "",
    landRightCount: getRosterLandRows(normalized).length,
    buildingRightCount: getRosterBuildingRows(normalized).length,
    lotCount: new Set(getRosterLandRows(normalized).map((row) => buildLotIdentityKey(row)).filter(Boolean)).size,
    summary: normalized.summary || {},
    landRows: getRosterLandRows(normalized),
    buildingRows: getRosterBuildingRows(normalized),
    landRowsSnapshot: getRosterLandRows(normalized),
    buildingRowsSnapshot: getRosterBuildingRows(normalized),
  };
}

function createRosterStagingFromRows({
  baseRoster,
  landRows,
  buildingRows,
  action,
  sourceFilename = "",
  fileName = "",
  versionHistory,
  priceUpdateHistory,
  extraIssues = [],
}) {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });
  const normalizedLandRows = landRows.map((row, index) => normalizeRosterLandRightRow(row, index));
  const normalizedBuildingRows = buildingRows.map((row, index) => normalizeRosterBuildingRightRow(row, index));
  const { partyRows, issues: partyIssues } = buildPartyPreview(normalizedLandRows, normalizedBuildingRows);
  const shareTotalIssues = buildLandShareTotalIssues(normalizedLandRows);
  const issues = [...(baseRoster?.issues ?? []), ...extraIssues, ...partyIssues, ...shareTotalIssues];
  const landNumbers = new Set(normalizedLandRows.map((row) => buildLotIdentityKey(row)).filter(Boolean));
  const buildingNumbers = new Set(normalizedBuildingRows.map((row) => row.buildingNumber).filter(Boolean));
  const rosterSummary = buildRosterBaseSummary({
    ...baseRoster,
    landRights: normalizedLandRows,
    landRows: normalizedLandRows,
    buildingRights: normalizedBuildingRows,
    buildingRows: normalizedBuildingRows,
  });
  const nextVersionHistory = Array.isArray(versionHistory)
    ? versionHistory
    : Array.isArray(baseRoster?.versionHistory)
      ? baseRoster.versionHistory
      : [];
  const nextPriceUpdateHistory = Array.isArray(priceUpdateHistory)
    ? priceUpdateHistory
    : Array.isArray(baseRoster?.priceUpdateHistory)
      ? baseRoster.priceUpdateHistory
      : [];
  const nextChangeLog = [
    ...(Array.isArray(baseRoster?.changeLog) ? baseRoster.changeLog : []),
    {
      action,
      sourceFilename,
      createdAt: now,
    },
  ];
  const nextSourceRecords = sourceFilename
    ? [
      ...(Array.isArray(baseRoster?.sourceRecords) ? baseRoster.sourceRecords : []),
      {
        sourceType: action,
        sourceFilename,
        importedAt: now,
        action,
      },
    ]
    : (Array.isArray(baseRoster?.sourceRecords) ? baseRoster.sourceRecords : []);

  return normalizeRosterStaging({
    ...(baseRoster ?? createEmptyRosterRecord()),
    fileName: fileName || baseRoster?.fileName || sourceFilename || "manual",
    importedAt: baseRoster?.importedAt || now,
    updatedAt: now,
    sourceType: baseRoster?.sourceType || action,
    sourceRecords: nextSourceRecords,
    changeLog: nextChangeLog,
    versionHistory: nextVersionHistory,
    priceUpdateHistory: nextPriceUpdateHistory,
    landRights: normalizedLandRows,
    landRows: normalizedLandRows,
    buildingRights: normalizedBuildingRows,
    buildingRows: normalizedBuildingRows,
    partyRows,
    partyGroups: partyRows,
    issues,
    summary: {
      landCount: normalizedLandRows.length,
      buildingCount: normalizedBuildingRows.length,
      partyCount: partyRows.length,
      landNumberCount: landNumbers.size,
      buildingNumberCount: buildingNumbers.size,
      cadastralLocationDisplay: rosterSummary.cadastralLocationDisplay,
      sameNameMultiLandCount: partyRows.filter((party) => party.landNumbers.length > 1).length,
      sameNameMultiBuildingCount: partyRows.filter((party) => party.buildingNumbers.length > 1).length,
      manualReviewCount: partyRows.filter((party) => !["已人工確認", "已完整資料確認"].includes(party.status)).length + issues.length,
      warningCount: issues.length,
    },
  });
}

function buildLandMergeKey(row, includeRegistrationOrder = true) {
  const parts = [
    buildLotIdentityKey(row),
    row.ownerName,
    row.shareNumerator,
    row.shareDenominator,
  ].map(normalizeCellValue);
  const registrationOrder = normalizeCellValue(row.registrationOrder);
  if (includeRegistrationOrder && registrationOrder) {
    parts.push(registrationOrder);
  }
  return parts.join("|");
}

function buildBuildingMergeKey(row) {
  return [
    buildLotIdentityKey(row),
    row.buildingNumber,
    row.ownerName,
  ].map(normalizeCellValue).join("|");
}

function buildLotValueKey(row) {
  return buildLotIdentityKey(row);
}

function rosterLotMatches(row, update) {
  const rowKey = buildLotIdentityKey(row);
  const updateKey = buildLotIdentityKey(update);

  return Boolean(rowKey && updateKey && rowKey === updateKey);
}

function hasCompleteLandMergeKey(row) {
  return [
    buildLotIdentityKey(row),
    row.ownerName,
    row.shareNumerator,
    row.shareDenominator,
  ].every((value) => normalizeCellValue(value));
}

function hasCompleteBuildingMergeKey(row) {
  return [
    buildLotIdentityKey(row),
    row.buildingNumber,
    row.ownerName,
  ].every((value) => normalizeCellValue(value));
}

const landRosterMergeCompareFields = [
  "city",
  "district",
  "section",
  "subsection",
  "lotNumber",
  "landNumber",
  "registrationOrder",
  "ownerName",
  "registeredOwnerName",
  "trusteeName",
  "trustorName",
  "ownershipType",
  "landAreaSqm",
  "shareNumerator",
  "shareDenominator",
  "shareRatio",
  "shareAreaSqm",
  "shareAreaPing",
  "registrationDate",
  "registrationReason",
  "causeDate",
  "titleNumber",
];

const landRosterPriceFields = [
  "announcedCurrentValue",
  "announcedCurrentValueYear",
  "declaredLandValue",
  "declaredLandValueYear",
];

const buildingRosterMergeCompareFields = [
  "city",
  "district",
  "section",
  "subsection",
  "lotNumber",
  "buildingNumber",
  "ownerName",
  "registeredOwnerName",
  "ownershipType",
  "buildingShareNumerator",
  "buildingShareDenominator",
  "buildingShareRatio",
  "buildingShareAreaSqm",
  "mainBuildingAreaSqm",
  "attachedBuildingAreaSqm",
  "commonAreaSqm",
  "commonShareNumerator",
  "commonShareDenominator",
  "commonShareAreaSqm",
  "registrationDate",
  "registrationReason",
  "titleNumber",
];

function buildLandMergeKeyCandidates(row) {
  const keys = [buildLandMergeKey(row, true), buildLandMergeKey(row, false)].filter(Boolean);
  return [...new Set(keys)];
}

function buildExistingLandMergeIndex(rows) {
  const index = new Map();
  rows.forEach((row, rowIndex) => {
    buildLandMergeKeyCandidates(row).forEach((key) => {
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key).push(rowIndex);
    });
  });
  return index;
}

function findMatchingLandRowIndex(rows, index, incomingRow) {
  for (const key of buildLandMergeKeyCandidates(incomingRow)) {
    const matches = index.get(key);
    if (matches?.length === 1) {
      return matches[0];
    }
  }
  return -1;
}

function normalizeRosterComparableValue(value) {
  const normalized = normalizeCellValue(value);
  if (!normalized) {
    return "";
  }
  const numeric = parseRosterNumber(normalized);
  return Number.isFinite(numeric) ? String(roundForStorage(numeric, INTERNAL_DECIMAL_DIGITS)) : normalized;
}

function rosterFieldsEqual(leftRow, rightRow, fields) {
  return fields.every((field) => normalizeRosterComparableValue(leftRow?.[field]) === normalizeRosterComparableValue(rightRow?.[field]));
}

function rosterFieldsDiffer(leftRow, rightRow, fields) {
  return fields.some((field) => normalizeRosterComparableValue(leftRow?.[field]) !== normalizeRosterComparableValue(rightRow?.[field]));
}

function summarizeRosterReimportAnalysis(analysis) {
  return {
    addedLandCount: analysis.newLandRows.length,
    addedBuildingCount: analysis.newBuildingRows.length,
    skippedDuplicateCount: analysis.duplicateLandRows.length + analysis.duplicateBuildingRows.length,
    conflictCount: analysis.conflictLandRows.length + analysis.conflictBuildingRows.length,
    manualReviewCount: analysis.reviewLandRows.length + analysis.reviewBuildingRows.length + analysis.conflictLandRows.length + analysis.conflictBuildingRows.length,
    priceUpdateCandidateCount: analysis.priceUpdateCandidates.length,
  };
}

function getRosterPreviewSourceType(preview) {
  return preview?.sourceFlow === "readable-pdf" || preview?.sourceType === "readable-pdf"
    ? "readable-pdf"
    : "roster-excel";
}

function createRosterActionHistoryEntry(action, fields = {}) {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });
  return {
    versionId: `RV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    createdAt: now,
    ...fields,
  };
}

function analyzeRosterReimport(existingRoster, incomingPreview) {
  const normalizedExisting = normalizeRosterStaging(existingRoster) || createEmptyRosterRecord();
  const normalizedIncoming = normalizeRosterStaging(incomingPreview) || createEmptyRosterRecord();
  const existingLandRows = getRosterLandRows(normalizedExisting);
  const existingBuildingRows = getRosterBuildingRows(normalizedExisting);
  const incomingLandRows = getRosterLandRows(normalizedIncoming);
  const incomingBuildingRows = getRosterBuildingRows(normalizedIncoming);
  const existingLandIndex = buildExistingLandMergeIndex(existingLandRows);
  const existingBuildingIndex = new Map(existingBuildingRows.map((row, index) => [buildBuildingMergeKey(row), index]));
  const analysis = {
    incomingLandRows,
    incomingBuildingRows,
    newLandRows: [],
    newBuildingRows: [],
    duplicateLandRows: [],
    duplicateBuildingRows: [],
    conflictLandRows: [],
    conflictBuildingRows: [],
    reviewLandRows: [],
    reviewBuildingRows: [],
    priceUpdateCandidates: [],
  };

  incomingLandRows.forEach((row) => {
    if (!hasCompleteLandMergeKey(row)) {
      analysis.reviewLandRows.push(row);
      return;
    }
    const existingIndex = findMatchingLandRowIndex(existingLandRows, existingLandIndex, row);
    if (existingIndex < 0) {
      analysis.newLandRows.push(row);
      return;
    }
    const existingRow = existingLandRows[existingIndex];
    const businessFieldsMatch = rosterFieldsEqual(existingRow, row, landRosterMergeCompareFields);
    const priceFieldsDiffer = rosterFieldsDiffer(existingRow, row, landRosterPriceFields);
    if (businessFieldsMatch && !priceFieldsDiffer) {
      analysis.duplicateLandRows.push(row);
      return;
    }
    if (businessFieldsMatch && priceFieldsDiffer) {
      analysis.priceUpdateCandidates.push({ existingRow, incomingRow: row });
      return;
    }
    analysis.conflictLandRows.push({ existingRow, incomingRow: row });
  });

  incomingBuildingRows.forEach((row) => {
    if (!hasCompleteBuildingMergeKey(row)) {
      analysis.reviewBuildingRows.push(row);
      return;
    }
    const existingIndex = existingBuildingIndex.get(buildBuildingMergeKey(row));
    if (!Number.isInteger(existingIndex)) {
      analysis.newBuildingRows.push(row);
      return;
    }
    const existingRow = existingBuildingRows[existingIndex];
    if (rosterFieldsEqual(existingRow, row, buildingRosterMergeCompareFields)) {
      analysis.duplicateBuildingRows.push(row);
      return;
    }
    analysis.conflictBuildingRows.push({ existingRow, incomingRow: row });
  });

  return {
    ...analysis,
    summary: summarizeRosterReimportAnalysis(analysis),
  };
}

function createReimportConflictIssues(analysis) {
  const issues = [];
  if (analysis.reviewLandRows.length || analysis.reviewBuildingRows.length) {
    issues.push(createRosterIssue(
      "重新匯入資料缺少比對 key",
      "中",
      `有 ${analysis.reviewLandRows.length} 筆土地、${analysis.reviewBuildingRows.length} 筆建物缺少必要比對欄位，已保留人工確認。`,
    ));
  }
  if (analysis.conflictLandRows.length || analysis.conflictBuildingRows.length) {
    issues.push(createRosterIssue(
      "重新匯入資料衝突",
      "中",
      `有 ${analysis.conflictLandRows.length} 筆土地、${analysis.conflictBuildingRows.length} 筆建物與既有 key 相同但內容不同，未自動套用。`,
    ));
  }
  if (analysis.priceUpdateCandidates.length) {
    issues.push(createRosterIssue(
      "重新匯入地價差異待確認",
      "低",
      `有 ${analysis.priceUpdateCandidates.length} 筆土地僅公告現值或申報地價不同；合併模式不自動更新地價，請改用「只更新公告現值 / 申報地價」。`,
    ));
  }
  return issues;
}

function buildPriceUpdatePlan(existingRoster, incomingPreview) {
  const normalizedExisting = normalizeRosterStaging(existingRoster) || createEmptyRosterRecord();
  const normalizedIncoming = normalizeRosterStaging(incomingPreview) || createEmptyRosterRecord();
  const existingLandRows = getRosterLandRows(normalizedExisting);
  const incomingLandRows = getRosterLandRows(normalizedIncoming);
  const existingRowsByLot = new Map();
  const incomingRowsByLot = new Map();

  existingLandRows.forEach((row) => {
    const key = buildLotValueKey(row);
    if (!key) return;
    if (!existingRowsByLot.has(key)) {
      existingRowsByLot.set(key, []);
    }
    existingRowsByLot.get(key).push(row);
  });
  incomingLandRows.forEach((row) => {
    const key = buildLotValueKey(row);
    if (!key || incomingRowsByLot.has(key)) return;
    incomingRowsByLot.set(key, row);
  });

  const updatedLots = [];
  const skippedNoPriceData = [];
  const unmatchedLots = [];
  incomingRowsByLot.forEach((incomingRow, lotKey) => {
    const existingRows = existingRowsByLot.get(lotKey);
    if (!existingRows?.length) {
      unmatchedLots.push(incomingRow);
      return;
    }
    const hasAnyPriceData = landRosterPriceFields.some((field) => normalizeCellValue(incomingRow[field]));
    if (!hasAnyPriceData) {
      skippedNoPriceData.push(incomingRow);
      return;
    }
    const existingRow = existingRows[0];
    const priceDiffers = rosterFieldsDiffer(existingRow, incomingRow, landRosterPriceFields);
    if (priceDiffers) {
      updatedLots.push({
        lotKey,
        existingRow,
        incomingRow,
        existingRows,
      });
    }
  });

  return {
    updatedLots,
    skippedNoPriceData,
    unmatchedLots,
  };
}

function applyPriceUpdatesFromPreview(existingRoster, incomingPreview, sourceFilename = "") {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });
  const normalizedExisting = normalizeRosterStaging(existingRoster) || createEmptyRosterRecord();
  const plan = buildPriceUpdatePlan(normalizedExisting, incomingPreview);
  const updateByLotKey = new Map(plan.updatedLots.map((item) => [item.lotKey, item.incomingRow]));
  const historyRows = plan.updatedLots.map(({ lotKey, existingRow, incomingRow }) => ({
    lotKey,
    city: existingRow.city,
    district: existingRow.district,
    section: existingRow.section,
    subsection: existingRow.subsection,
    lotNumber: existingRow.lotNumber || existingRow.landNumber,
    oldAnnouncedCurrentValue: existingRow.announcedCurrentValue,
    newAnnouncedCurrentValue: incomingRow.announcedCurrentValue,
    oldAnnouncedCurrentValueYear: existingRow.announcedCurrentValueYear,
    newAnnouncedCurrentValueYear: incomingRow.announcedCurrentValueYear,
    oldDeclaredLandValue: existingRow.declaredLandValue,
    newDeclaredLandValue: incomingRow.declaredLandValue,
    oldDeclaredLandValueYear: existingRow.declaredLandValueYear,
    newDeclaredLandValueYear: incomingRow.declaredLandValueYear,
    updatedAt: now,
    sourceFilename,
  }));
  const landRows = getRosterLandRows(normalizedExisting).map((row) => {
    const update = updateByLotKey.get(buildLotValueKey(row));
    if (!update) {
      return row;
    }
    return {
      ...row,
      announcedCurrentValue: normalizeCellValue(update.announcedCurrentValue) || row.announcedCurrentValue,
      announcedCurrentValueYear: normalizeCellValue(update.announcedCurrentValueYear) || row.announcedCurrentValueYear,
      declaredLandValue: normalizeCellValue(update.declaredLandValue) || row.declaredLandValue,
      declaredLandValueYear: normalizeCellValue(update.declaredLandValueYear) || row.declaredLandValueYear,
      rowStatus: "edited",
      updatedAt: now,
      valueHistory: [
        ...(Array.isArray(row.valueHistory) ? row.valueHistory : []),
        ...historyRows
          .filter((history) => history.lotKey === buildLotValueKey(row))
          .map((history) => ({
            updatedAt: now,
            announcedCurrentValue: history.oldAnnouncedCurrentValue,
            announcedCurrentValueYear: history.oldAnnouncedCurrentValueYear,
            declaredLandValue: history.oldDeclaredLandValue,
            declaredLandValueYear: history.oldDeclaredLandValueYear,
            sourceFilename,
          })),
      ],
    };
  });
  const priceUpdateHistoryEntry = {
    action: "price-update",
    updatedAt: now,
    sourceFilename,
    updatedLotCount: plan.updatedLots.length,
    skippedNoPriceDataCount: plan.skippedNoPriceData.length,
    unmatchedLotCount: plan.unmatchedLots.length,
    updates: historyRows,
    skippedNoPriceDataLots: plan.skippedNoPriceData.map((row) => getLandDisplayLabel(row)),
    unmatchedLots: plan.unmatchedLots.map((row) => getLandDisplayLabel(row)),
  };
  const versionHistoryEntry = createRosterActionHistoryEntry("price-update", {
    updatedAt: now,
    sourceFilename,
    updatedLotCount: plan.updatedLots.length,
    skippedNoPriceDataCount: plan.skippedNoPriceData.length,
    unmatchedLotCount: plan.unmatchedLots.length,
  });

  return {
    roster: createRosterStagingFromRows({
      baseRoster: normalizedExisting,
      landRows,
      buildingRows: getRosterBuildingRows(normalizedExisting),
      action: "price-update",
      sourceFilename,
      versionHistory: [
        ...(Array.isArray(normalizedExisting.versionHistory) ? normalizedExisting.versionHistory : []),
        versionHistoryEntry,
      ],
      priceUpdateHistory: [
        ...(Array.isArray(normalizedExisting.priceUpdateHistory) ? normalizedExisting.priceUpdateHistory : []),
        priceUpdateHistoryEntry,
      ],
    }),
    plan,
    updatedLotCount: plan.updatedLots.length,
  };
}

function applyRosterReimportMode(existingRoster, incomingPreview, mode, sourceFilename = "") {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });
  const normalizedExisting = normalizeRosterStaging(existingRoster) || createEmptyRosterRecord();
  const normalizedIncoming = normalizeRosterStaging(incomingPreview) || createEmptyRosterRecord();
  const sourceType = getRosterPreviewSourceType(normalizedIncoming);
  const existingVersionHistory = Array.isArray(normalizedExisting.versionHistory) ? normalizedExisting.versionHistory : [];
  const previousLandCount = getRosterLandRows(normalizedExisting).length;
  const previousBuildingCount = getRosterBuildingRows(normalizedExisting).length;
  const newLandCount = getRosterLandRows(normalizedIncoming).length;
  const newBuildingCount = getRosterBuildingRows(normalizedIncoming).length;

  if (mode === "replace") {
    const replaceEntry = createRosterActionHistoryEntry("replace", {
      replacedAt: now,
      sourceFilename,
      previousLandCount,
      previousBuildingCount,
      newLandCount,
      newBuildingCount,
      previousRoster: createRosterVersionSnapshot(normalizedExisting, "取代目前清冊前備份"),
    });
    return {
      roster: createRosterStagingFromRows({
        baseRoster: normalizedIncoming,
        landRows: getRosterLandRows(normalizedIncoming).map((row) => ({
          ...row,
          rowStatus: "imported",
          sourceType: row.sourceType || sourceType,
          sourceFilename: row.sourceFilename || sourceFilename,
          importedAt: row.importedAt || now,
          updatedAt: now,
        })),
        buildingRows: getRosterBuildingRows(normalizedIncoming).map((row) => ({
          ...row,
          rowStatus: "imported",
          sourceType: row.sourceType || sourceType,
          sourceFilename: row.sourceFilename || sourceFilename,
          importedAt: row.importedAt || now,
          updatedAt: now,
        })),
        action: "replace",
        sourceFilename,
        fileName: sourceFilename,
        versionHistory: [...existingVersionHistory, replaceEntry],
        priceUpdateHistory: Array.isArray(normalizedExisting.priceUpdateHistory) ? normalizedExisting.priceUpdateHistory : [],
      }),
      analysis: null,
      message: `已取代目前清冊，舊清冊已保存到版本紀錄；新清冊包含 ${newLandCount} 筆土地、${newBuildingCount} 筆建物。`,
    };
  }

  if (mode === "merge") {
    const analysis = analyzeRosterReimport(normalizedExisting, normalizedIncoming);
    const nextLandRows = getRosterLandRows(normalizedExisting).map((row) => ({ ...row }));
    const nextBuildingRows = getRosterBuildingRows(normalizedExisting).map((row) => ({ ...row }));
    analysis.newLandRows.forEach((row) => {
      const rowId = nextRosterSequenceId(nextLandRows, "LR");
      nextLandRows.push({
        ...row,
        rowId,
        landRightRowId: rowId,
        rowStatus: "added",
        sourceType: "supplemental-import",
        sourceFilename,
        importedAt: row.importedAt || now,
        updatedAt: now,
      });
    });
    analysis.newBuildingRows.forEach((row) => {
      const rowId = nextRosterSequenceId(nextBuildingRows, "BR");
      nextBuildingRows.push({
        ...row,
        rowId,
        buildingRightRowId: rowId,
        rowStatus: "added",
        sourceType: "supplemental-import",
        sourceFilename,
        importedAt: row.importedAt || now,
        updatedAt: now,
      });
    });
    const summary = summarizeRosterReimportAnalysis(analysis);
    const mergeEntry = createRosterActionHistoryEntry("merge", {
      mergedAt: now,
      sourceFilename,
      ...summary,
    });
    return {
      roster: createRosterStagingFromRows({
        baseRoster: normalizedExisting,
        landRows: nextLandRows,
        buildingRows: nextBuildingRows,
        action: "merge",
        sourceFilename,
        versionHistory: [...existingVersionHistory, mergeEntry],
        extraIssues: createReimportConflictIssues(analysis),
      }),
      analysis,
      message: `已完成合併：新增土地 ${summary.addedLandCount} 筆、建物 ${summary.addedBuildingCount} 筆，跳過重複 ${summary.skippedDuplicateCount} 筆，衝突 ${summary.conflictCount} 筆保留人工確認。`,
    };
  }

  if (mode === "new-version") {
    const snapshot = createRosterActionHistoryEntry("create-version", {
      versionId: `RV-${Date.now()}`,
      createdAt: now,
      sourceFilename,
      landCount: newLandCount,
      buildingCount: newBuildingCount,
      lotCount: new Set(getRosterLandRows(normalizedIncoming).map((row) => buildLotIdentityKey(row)).filter(Boolean)).size,
      summary: normalizedIncoming.summary || {},
      landRowsSnapshot: getRosterLandRows(normalizedIncoming),
      buildingRowsSnapshot: getRosterBuildingRows(normalizedIncoming),
    });
    return {
      roster: createRosterStagingFromRows({
        baseRoster: normalizedExisting,
        landRows: getRosterLandRows(normalizedExisting),
        buildingRows: getRosterBuildingRows(normalizedExisting),
        action: "create-version",
        sourceFilename,
        versionHistory: [...existingVersionHistory, snapshot],
      }),
      analysis: null,
      message: "已建立新清冊版本，目前案件清冊未被取代。",
    };
  }

  const priceResult = applyPriceUpdatesFromPreview(normalizedExisting, normalizedIncoming, sourceFilename);
  return {
    ...priceResult,
    analysis: null,
    message: `已更新 ${priceResult.updatedLotCount} 筆地籍資料的公告現值 / 申報地價；權利人、面積與持分未變更。`,
  };
}

function analyzeRosterSupplement(existingRoster, incomingPreview) {
  const existingLandRows = getRosterLandRows(existingRoster);
  const existingBuildingRows = getRosterBuildingRows(existingRoster);
  const incomingLandRows = getRosterLandRows(incomingPreview);
  const incomingBuildingRows = getRosterBuildingRows(incomingPreview);
  const existingLandKeys = new Set(existingLandRows.map(buildLandMergeKey).filter(Boolean));
  const existingBuildingKeys = new Set(existingBuildingRows.map(buildBuildingMergeKey).filter(Boolean));
  const newLandRows = incomingLandRows.filter((row) => hasCompleteLandMergeKey(row) && !existingLandKeys.has(buildLandMergeKey(row)));
  const updateLandRows = incomingLandRows.filter((row) => hasCompleteLandMergeKey(row) && existingLandKeys.has(buildLandMergeKey(row)));
  const reviewLandRows = incomingLandRows.filter((row) => !hasCompleteLandMergeKey(row));
  const newBuildingRows = incomingBuildingRows.filter((row) => hasCompleteBuildingMergeKey(row) && !existingBuildingKeys.has(buildBuildingMergeKey(row)));
  const updateBuildingRows = incomingBuildingRows.filter((row) => hasCompleteBuildingMergeKey(row) && existingBuildingKeys.has(buildBuildingMergeKey(row)));
  const reviewBuildingRows = incomingBuildingRows.filter((row) => !hasCompleteBuildingMergeKey(row));

  return {
    incomingLandRows,
    incomingBuildingRows,
    newLandRows,
    updateLandRows,
    reviewLandRows,
    newBuildingRows,
    updateBuildingRows,
    reviewBuildingRows,
  };
}

function applySupplementalImport(existingRoster, incomingPreview, mode) {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });
  const normalizedExisting = normalizeRosterStaging(existingRoster) || createEmptyRosterRecord();
  const analysis = analyzeRosterSupplement(normalizedExisting, incomingPreview);

  if (mode === "review-only") {
    return {
      roster: createRosterStagingFromRows({
        baseRoster: normalizedExisting,
        landRows: getRosterLandRows(normalizedExisting),
        buildingRows: getRosterBuildingRows(normalizedExisting),
        action: "supplemental-review-only",
        sourceFilename: incomingPreview.fileName,
        extraIssues: [
          createRosterIssue("補充資料待人工確認", "中", `已解析 ${analysis.incomingLandRows.length} 筆土地、${analysis.incomingBuildingRows.length} 筆建物，尚未寫入清冊。`),
        ],
      }),
      analysis,
    };
  }

  const existingLandByKey = new Map(getRosterLandRows(normalizedExisting).map((row) => [buildLandMergeKey(row), row]));
  const existingBuildingByKey = new Map(getRosterBuildingRows(normalizedExisting).map((row) => [buildBuildingMergeKey(row), row]));
  const nextLandRows = getRosterLandRows(normalizedExisting).map((row) => ({ ...row }));
  const nextBuildingRows = getRosterBuildingRows(normalizedExisting).map((row) => ({ ...row }));
  const updateLandIndexes = new Map(nextLandRows.map((row, index) => [buildLandMergeKey(row), index]));
  const updateBuildingIndexes = new Map(nextBuildingRows.map((row, index) => [buildBuildingMergeKey(row), index]));

  if (mode === "add-new" || mode === "merge-update") {
    analysis.newLandRows.forEach((row) => {
      const rowId = nextRosterSequenceId(nextLandRows, "LR");
      nextLandRows.push({
        ...row,
        rowId,
        landRightRowId: rowId,
        rowStatus: "added",
        sourceType: "supplemental-excel",
        sourceFilename: incomingPreview.fileName,
        importedAt: row.importedAt || now,
        updatedAt: now,
      });
    });
    analysis.newBuildingRows.forEach((row) => {
      const rowId = nextRosterSequenceId(nextBuildingRows, "BR");
      nextBuildingRows.push({
        ...row,
        rowId,
        buildingRightRowId: rowId,
        rowStatus: "added",
        sourceType: "supplemental-excel",
        sourceFilename: incomingPreview.fileName,
        importedAt: row.importedAt || now,
        updatedAt: now,
      });
    });
  }

  if (mode === "merge-update") {
    analysis.updateLandRows.forEach((row) => {
      const index = updateLandIndexes.get(buildLandMergeKey(row));
      if (Number.isInteger(index)) {
        const existing = existingLandByKey.get(buildLandMergeKey(row));
        nextLandRows[index] = {
          ...existing,
          ...row,
          rowId: existing.rowId,
          landRightRowId: existing.landRightRowId || existing.rowId,
          rowStatus: "edited",
          sourceType: "supplemental-excel",
          sourceFilename: incomingPreview.fileName,
          importedAt: existing.importedAt || row.importedAt,
          updatedAt: now,
        };
      }
    });
    analysis.updateBuildingRows.forEach((row) => {
      const index = updateBuildingIndexes.get(buildBuildingMergeKey(row));
      if (Number.isInteger(index)) {
        const existing = existingBuildingByKey.get(buildBuildingMergeKey(row));
        nextBuildingRows[index] = {
          ...existing,
          ...row,
          rowId: existing.rowId,
          buildingRightRowId: existing.buildingRightRowId || existing.rowId,
          rowStatus: "edited",
          sourceType: "supplemental-excel",
          sourceFilename: incomingPreview.fileName,
          importedAt: existing.importedAt || row.importedAt,
          updatedAt: now,
        };
      }
    });
  }

  return {
    roster: createRosterStagingFromRows({
      baseRoster: normalizedExisting,
      landRows: nextLandRows,
      buildingRows: nextBuildingRows,
      action: `supplemental-${mode}`,
      sourceFilename: incomingPreview.fileName,
    }),
    analysis,
  };
}

function applyValueUpdates(existingRoster, updates) {
  const now = new Date().toLocaleString("zh-TW", { hour12: false });
  const normalizedExisting = normalizeRosterStaging(existingRoster) || createEmptyRosterRecord();
  const normalizedUpdates = updates.filter((item) => buildLotIdentityKey(item));
  let updatedCount = 0;
  const historyRows = [];
  const landRows = getRosterLandRows(normalizedExisting).map((row) => {
    const update = normalizedUpdates.find((item) => rosterLotMatches(row, item));
    if (!update) {
      return row;
    }

    updatedCount += 1;
    historyRows.push({
      lotIdentityKey: buildLotIdentityKey(row),
      landDisplayLabel: getLandDisplayLabel(row),
      lotNumber: row.lotNumber || row.landNumber,
      oldAnnouncedCurrentValue: row.announcedCurrentValue,
      newAnnouncedCurrentValue: normalizeCellValue(update.announcedCurrentValue) || row.announcedCurrentValue,
      oldAnnouncedCurrentValueYear: row.announcedCurrentValueYear,
      newAnnouncedCurrentValueYear: normalizeCellValue(update.announcedCurrentValueYear) || row.announcedCurrentValueYear,
      oldDeclaredLandValue: row.declaredLandValue,
      newDeclaredLandValue: normalizeCellValue(update.declaredLandValue) || row.declaredLandValue,
      oldDeclaredLandValueYear: row.declaredLandValueYear,
      newDeclaredLandValueYear: normalizeCellValue(update.declaredLandValueYear) || row.declaredLandValueYear,
      updatedAt: now,
      sourceFilename: updates[0]?.sourceFilename || "manual-value-update",
    });
    const previousValueNote = [
      `前次公告現值：${normalizeCellValue(row.announcedCurrentValue) || "未填"}（${normalizeCellValue(row.announcedCurrentValueYear) || "未填年度"}）`,
      `前次申報地價：${normalizeCellValue(row.declaredLandValue) || "未填"}（${normalizeCellValue(row.declaredLandValueYear) || "未填年度"}）`,
    ].join("；");

    return {
      ...row,
      announcedCurrentValue: normalizeCellValue(update.announcedCurrentValue) || row.announcedCurrentValue,
      announcedCurrentValueYear: normalizeCellValue(update.announcedCurrentValueYear) || row.announcedCurrentValueYear,
      declaredLandValue: normalizeCellValue(update.declaredLandValue) || row.declaredLandValue,
      declaredLandValueYear: normalizeCellValue(update.declaredLandValueYear) || row.declaredLandValueYear,
      valueHistory: [
        ...(Array.isArray(row.valueHistory) ? row.valueHistory : []),
        {
          updatedAt: now,
          announcedCurrentValue: row.announcedCurrentValue,
          announcedCurrentValueYear: row.announcedCurrentValueYear,
          declaredLandValue: row.declaredLandValue,
          declaredLandValueYear: row.declaredLandValueYear,
          note: update.notes || "",
        },
      ],
      notes: [row.notes, previousValueNote, update.notes].filter(Boolean).join("；"),
      rowStatus: "edited",
      updatedAt: now,
    };
  });

  return {
    roster: createRosterStagingFromRows({
      baseRoster: normalizedExisting,
      landRows,
      buildingRows: getRosterBuildingRows(normalizedExisting),
      action: "land-value-update",
      sourceFilename: updates[0]?.sourceFilename || "manual-value-update",
      priceUpdateHistory: [
        ...(Array.isArray(normalizedExisting.priceUpdateHistory) ? normalizedExisting.priceUpdateHistory : []),
        {
          action: "manual-price-update",
          updatedAt: now,
          sourceFilename: updates[0]?.sourceFilename || "manual-value-update",
          updatedRowCount: updatedCount,
          updates: historyRows,
        },
      ],
    }),
    updatedCount,
  };
}

function formatRosterPreviewCell(row, column) {
  const value = row[column.key];
  if (Array.isArray(value)) {
    return value.join("、") || "未填";
  }
  if (normalizeCellValue(value)) {
    return value;
  }
  return ["city", "district"].includes(column.key) ? "原檔未提供" : "未填";
}

function RosterPreviewTable({ title, description, emptyText, columns, rows }) {
  const visibleRows = rows.slice(0, 20);
  return (
    <section className="eval-module-section">
      <div className="eval-section-head">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
      {rows.length ? (
        <div className="eval-table-wrap eval-roster-preview-scroll">
          {rows.length > visibleRows.length && (
            <p className="eval-roster-helper">預覽先顯示前 20 筆；完整資料會保留在案件清冊與系統產生 Excel。</p>
          )}
          <table className="eval-table eval-roster-preview-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={`${title}-${row[columns[0].key] || index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>{formatRosterPreviewCell(row, column)}</td>
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
  const rows = rosterStaging?.landRights ?? rosterStaging?.landRows ?? [];
  return Array.isArray(rows) ? rows.map((row, index) => normalizeRosterLandRightRow(row, index)) : [];
}

function getRosterBuildingRows(rosterStaging) {
  const rows = rosterStaging?.buildingRights ?? rosterStaging?.buildingRows ?? [];
  return Array.isArray(rows) ? rows.map((row, index) => normalizeRosterBuildingRightRow(row, index)) : [];
}

function parseRosterNumber(value) {
  return parsePrecisionNumber(value);
}

function formatAreaSummary(value) {
  return formatSqmAndPing(value);
}

function buildCadastralLocationDisplay(landRows) {
  const locations = new Map();

  landRows.forEach((row) => {
    const parts = [
      normalizeCellValue(row.city),
      normalizeCellValue(row.district),
      normalizeCellValue(row.section),
      normalizeCellValue(row.subsection),
    ];

    if (!parts.some(Boolean)) {
      return;
    }

    locations.set(parts.join("|"), parts.filter(Boolean).join(" "));
  });

  if (!locations.size) {
    return "待清冊補齊";
  }

  if (locations.size > 1) {
    return "多筆地籍定位，請查看清冊明細";
  }

  return Array.from(locations.values())[0] || "待清冊補齊";
}

function buildRosterYearDisplay(rows, fieldKey) {
  const years = Array.from(new Set(rows
    .map((row) => normalizeCellValue(row[fieldKey]))
    .filter(Boolean)));

  if (!years.length) {
    return "待清冊補齊";
  }

  if (years.length > 1) {
    return `多年度：${years.slice(0, 3).join("、")}${years.length > 3 ? "…" : ""}`;
  }

  return years[0];
}

function buildRosterLatestSourceDisplay(rosterStaging, landRows, buildingRows) {
  const explicitSource = normalizeCellValue(rosterStaging?.fileName || rosterStaging?.sourceFilename);
  if (explicitSource) {
    return explicitSource;
  }

  const rowSource = [...landRows, ...buildingRows]
    .map((row) => normalizeCellValue(row.sourceFilename || row.sourceFile))
    .find(Boolean);

  return rowSource || "尚未建立來源紀錄";
}

function buildRosterBaseSummary(rosterStaging) {
  const landRows = getRosterLandRows(rosterStaging);
  const buildingRows = getRosterBuildingRows(rosterStaging);
  const uniqueLandRows = buildUniqueLandRows(landRows);
  const landNumbers = uniqueLandRows.map((row) => row.landDisplayLabel || getLandDisplayLabel(row));
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
    buildingRightCount: buildingRows.length,
    landNumberCount: landNumbers.length,
    landNumbers,
    landNumberDisplay: landNumbers.length > 5
      ? `${landNumbers.slice(0, 5).join("、")}…共 ${landNumbers.length} 筆`
      : landNumbers.join("、") || "待清冊補齊",
    cadastralLocationDisplay: buildCadastralLocationDisplay(uniqueLandRows),
    landAreaSqm: areaTotal,
    landAreaSummary: areaTotal === null ? "待清冊補齊" : formatAreaSummary(areaTotal),
    assessedCurrentValueTotal: assessedCurrentValueSummary.assessedCurrentValueTotal,
    assessedCurrentValueWeightedUnit: assessedCurrentValueSummary.assessedCurrentValueWeightedUnit,
    assessedCurrentValueByLot: assessedCurrentValueSummary.assessedCurrentValueByLot,
    assessedCurrentValueSourceStatus: assessedCurrentValueSummary.assessedCurrentValueSourceStatus,
    announcedCurrentValueStatus: assessedCurrentValueSummary.assessedCurrentValueSourceStatus,
    announcedCurrentValueYear: buildRosterYearDisplay(uniqueLandRows, "announcedCurrentValueYear"),
    declaredLandValueYear: buildRosterYearDisplay(uniqueLandRows, "declaredLandValueYear"),
    latestSource: buildRosterLatestSourceDisplay(rosterStaging, landRows, buildingRows),
    announcedLandValueStatus: announcedLandValueCount
      ? `清冊已提供 ${announcedLandValueCount} 筆地籍資料`
      : "清冊未提供",
  };
}

function buildAssessedCurrentValueSummary(rosterStaging) {
  const landRows = getRosterLandRows(rosterStaging);
  return buildAssessedCurrentValueSummaryFromLandRows(landRows);
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

function normalizeCostItemInput(definition, itemInput) {
  const baseInput = defaultCostInputs.commonItems[definition.id] ?? {};
  return {
    ...baseInput,
    ...(isPlainRecord(itemInput) ? itemInput : {}),
  };
}

function normalizeCostInputs(costInputs) {
  const inputRecord = isPlainRecord(costInputs) ? costInputs : {};
  const commonItems = {};
  const otherCostItems = {};

  costCommonItemDefinitions.forEach((definition) => {
    commonItems[definition.id] = normalizeCostItemInput(
      definition,
      inputRecord.commonItems?.[definition.id],
    );
  });

  otherCostItemDefinitions.forEach((definition) => {
    otherCostItems[definition.id] = {
      ...defaultCostInputs.otherCostItems[definition.id],
      ...(isPlainRecord(inputRecord.otherCostItems?.[definition.id]) ? inputRecord.otherCostItems[definition.id] : {}),
    };
  });

  return { ...inputRecord, commonItems, otherCostItems };
}

function getCostSourceQuantity(quantitySource, context) {
  if (quantitySource === "totalFloorAreaSqm") {
    return pickNumericValue(context.floorResult?.totalFloorAreaSqm);
  }
  if (quantitySource === "landNumberCount") {
    return Number.isFinite(context.rosterSummary?.landNumberCount) ? context.rosterSummary.landNumberCount : null;
  }
  if (quantitySource === "landAreaSqm") {
    return pickNumericValue(context.rosterSummary?.landAreaSqm, context.capacityResult?.landAreaSqm);
  }
  return null;
}

function getCostQuantity(input, definition, context) {
  const quantity = parseNumericInput(input.quantity);
  return Number.isFinite(quantity) ? quantity : getCostSourceQuantity(definition.quantitySource, context);
}

function getDemolitionCap(input) {
  return demolitionUnitPriceCaps[input.structureType] ?? null;
}

function calculateProgressiveSalesManagementFee(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  const firstTier = Math.min(value, 2500000000) * 0.06;
  const secondTier = Math.min(Math.max(value - 2500000000, 0), 2500000000) * 0.055;
  const thirdTier = Math.max(value - 5000000000, 0) * 0.05;
  return firstTier + secondTier + thirdTier;
}

function calculatePersonnelAdminRate(propertyCount, landAreaSqm) {
  const propertyBand = propertyCount < 30 ? 0 : propertyCount <= 150 ? 1 : 2;
  const areaBand = landAreaSqm < 1500 ? 0 : landAreaSqm < 2500 ? 1 : 2;
  const rateMatrix = [
    [4, 4.5, 5],
    [4.5, 5, 5.5],
    [5, 5.5, 6],
  ];
  return rateMatrix[areaBand][propertyBand];
}

function calculateRiskManagementRate(propertyCount, totalFloorAreaPing) {
  const propertyBand = propertyCount < 30 ? 0 : propertyCount <= 150 ? 1 : 2;
  const areaBand = totalFloorAreaPing <= 2500 ? 0 : totalFloorAreaPing <= 7500 ? 1 : 2;
  const rateMatrix = [
    [12, 12.5, 13],
    [12.5, 13, 13.5],
    [13, 13.5, 14],
  ];
  return rateMatrix[areaBand][propertyBand];
}

function calculateCostItemAmount(definition, input, context, calculatedItems, groupTotals) {
  if (!input.included) {
    return { amount: 0, warning: "", status: "未列入共同負擔" };
  }

  const warnings = [];
  let amount = 0;
  let status = "待填";

  if (definition.mode === "quantityUnit") {
    const quantity = getCostQuantity(input, definition, context);
    const unitPrice = parseNumericInput(input.unitPrice);
    amount = Number.isFinite(quantity) && Number.isFinite(unitPrice) ? quantity * unitPrice : 0;
    status = amount > 0 ? "可初算" : "待填";
    const capUnitPrice = definition.id === "a1Demolition" ? getDemolitionCap(input) : definition.capUnitPrice;
    if (Number.isFinite(capUnitPrice) && Number.isFinite(unitPrice) && unitPrice > capUnitPrice) {
      warnings.push("超出新北市基準，需佐證 / 審議確認");
    }
  } else if (definition.mode === "planningFee") {
    amount = 1500000
      + 3000000
      + 1500000
      + (parseNumericInput(input.xFee) ?? 0)
      + (parseNumericInput(input.yFee) ?? 0)
      + (parseNumericInput(input.otherFee) ?? 0);
    status = "依新北市 P1/P2/P3 架構初算";
  } else if (definition.mode === "loanInterest") {
    const componentOneAmount = parseNumericInput(input.componentOneAmount) ?? 0;
    const componentTwoAmount = parseNumericInput(input.componentTwoAmount) ?? 0;
    const annualRate = parseNumericInput(input.annualRate);
    const loanMonths = parseNumericInput(input.loanMonths);
    amount = Number.isFinite(annualRate) && Number.isFinite(loanMonths)
      ? (componentOneAmount * (annualRate / 100) * (loanMonths / 12))
        + (componentTwoAmount * (annualRate / 100) * (loanMonths / 12) * 0.5)
      : 0;
    status = amount > 0 ? "依貸款利息公式初算" : "待填";
  } else if (definition.mode === "administrativeFee") {
    const rate = parseNumericInput(input.rate) ?? 2.5;
    amount = Number.isFinite(context.rosterSummary.assessedCurrentValueTotal)
      ? context.rosterSummary.assessedCurrentValueTotal * (rate / 100)
      : 0;
    status = amount > 0 ? "依公告現值初算" : "待清冊公告現值";
  } else if (definition.mode === "personnelAdmin") {
    const propertyCount = context.rosterSummary.landRightCount || 0;
    const landAreaSqm = context.rosterSummary.landAreaSqm || 0;
    const rate = calculatePersonnelAdminRate(propertyCount, landAreaSqm);
    amount = ((groupTotals.A ?? 0) + (groupTotals.C ?? 0) + (groupTotals.G ?? 0)) * (rate / 100);
    status = `自動判斷上限 ${formatPercentValue(rate)}`;
  } else if (definition.mode === "salesManagement") {
    const allocationValue = parseNumericInput(input.allocationValue);
    amount = calculateProgressiveSalesManagementFee(allocationValue);
    status = amount > 0 ? "級距累進初算" : "待填實施者獲配價值";
  } else if (definition.mode === "riskManagement") {
    const propertyCount = context.rosterSummary.landRightCount || 0;
    const totalFloorAreaPing = pickNumericValue(
      context.floorResult?.totalFloorAreaPing,
      Number.isFinite(context.floorResult?.totalFloorAreaSqm) ? convertSqmToPing(context.floorResult.totalFloorAreaSqm) : null,
    ) ?? 0;
    const autoRate = calculateRiskManagementRate(propertyCount, totalFloorAreaPing);
    const rate = parseNumericInput(input.rate) ?? autoRate;
    const riskBase = (groupTotals.A ?? 0)
      + (groupTotals.C ?? 0)
      + (groupTotals.D ?? 0)
      + (calculatedItems.f1AdminOperation?.amount ?? 0)
      + (calculatedItems.f2Trust?.amount ?? 0)
      + (calculatedItems.f3PersonnelAdmin?.amount ?? 0)
      + (groupTotals.G ?? 0)
      + (groupTotals.H ?? 0);
    amount = riskBase * (rate / 100);
    status = `自動判斷上限 ${formatPercentValue(autoRate)}`;
    if (rate > 14) {
      warnings.push("風險管理費率超過 14%，需審議確認");
    }
  } else {
    amount = parseNumericInput(input.amount) ?? 0;
    status = amount > 0 ? "依輸入金額" : "待填";
  }

  if (definition.reviewRequired) {
    warnings.push("需合約佐證 / 審議確認");
  }
  if (definition.temporary || input.temporary) {
    warnings.push("目前暫估");
  }

  return {
    amount,
    warning: warnings.join("；"),
    status,
  };
}

function calculateCostResults(costInputs, rosterStaging, baseInfo, capacityResult, floorResult) {
  const effectiveInputs = normalizeCostInputs(costInputs);
  const rosterSummary = buildRosterBaseSummary(rosterStaging);
  const context = { rosterSummary, baseInfo, capacityResult, floorResult };
  const items = {};
  const groupTotals = Object.fromEntries(costCommonGroups.map((group) => [group.id, 0]));
  const deferredItemIds = new Set(["f3PersonnelAdmin", "f5RiskManagement"]);

  costCommonItemDefinitions.forEach((definition) => {
    if (deferredItemIds.has(definition.id)) {
      return;
    }
    const input = effectiveInputs.commonItems[definition.id];
    const result = calculateCostItemAmount(definition, input, context, items, groupTotals);
    items[definition.id] = result;
    groupTotals[definition.groupId] += result.amount;
  });

  ["f3PersonnelAdmin", "f5RiskManagement"].forEach((itemId) => {
    const definition = costCommonItemDefinitions.find((item) => item.id === itemId);
    const result = calculateCostItemAmount(definition, effectiveInputs.commonItems[itemId], context, items, groupTotals);
    items[itemId] = result;
    groupTotals[definition.groupId] += result.amount;
  });

  const otherItems = {};
  let otherCostTotal = 0;
  otherCostItemDefinitions.forEach((definition) => {
    const input = effectiveInputs.otherCostItems[definition.id];
    const amount = parseNumericInput(input.amount) ?? 0;
    otherItems[definition.id] = {
      amount,
      status: amount > 0 ? "公司內部成本" : "待填",
    };
    otherCostTotal += amount;
  });

  const commonBurdenTotal = Object.values(groupTotals).reduce((total, amount) => total + amount, 0);
  return roundRecordNumbers({
    jurisdiction: "new-taipei",
    groupTotals,
    items,
    otherItems,
    commonBurdenTotal,
    otherCostTotal,
    internalTotalCost: commonBurdenTotal + otherCostTotal,
    sourceSummary: {
      landAreaSqm: rosterSummary.landAreaSqm,
      landRightCount: rosterSummary.landRightCount,
      landNumberCount: rosterSummary.landNumberCount,
      assessedCurrentValueTotal: rosterSummary.assessedCurrentValueTotal,
      totalCapacityAreaSqm: capacityResult?.totalCapacityAreaSqm ?? null,
      transferRatio: capacityResult?.transferRatio ?? null,
      transferAreaSqm: capacityResult?.transferAreaSqm ?? null,
      tdrScoringSummary: capacityResult?.tdrScoringSummary ?? null,
    },
  }, INTERNAL_DECIMAL_DIGITS);
}

function recalculateCostResultsByCaseId({
  cases,
  costInputsByCaseId,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyResultsByCaseId,
}) {
  const nextResults = {};
  (Array.isArray(cases) ? cases : []).forEach((caseItem) => {
    if (!caseItem?.id || !isPlainRecord(costInputsByCaseId?.[caseItem.id])) {
      return;
    }
    nextResults[caseItem.id] = calculateCostResults(
      costInputsByCaseId[caseItem.id],
      rosterStagingByCaseId?.[caseItem.id],
      baseInfoByCaseId?.[caseItem.id],
      capacityResultsByCaseId?.[caseItem.id],
      floorEfficiencyResultsByCaseId?.[caseItem.id],
    );
  });
  return nextResults;
}

function buildCompleteCostInputsByCaseId(cases, costInputsByCaseId) {
  const inputRecords = isPlainRecord(costInputsByCaseId) ? costInputsByCaseId : {};
  const caseIds = new Set(Object.keys(inputRecords));

  (Array.isArray(cases) ? cases : []).forEach((caseItem) => {
    if (caseItem?.id) {
      caseIds.add(caseItem.id);
    }
  });

  const nextInputs = {};
  caseIds.forEach((caseId) => {
    nextInputs[caseId] = normalizeCostInputs(inputRecords[caseId]);
  });
  return nextInputs;
}

function buildCompleteCostRecordsByCaseId({
  cases,
  costInputsByCaseId,
  costResultsByCaseId,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyResultsByCaseId,
}) {
  const completeCostInputs = buildCompleteCostInputsByCaseId(cases, costInputsByCaseId);
  const completeCostResults = {
    ...(isPlainRecord(costResultsByCaseId) ? costResultsByCaseId : {}),
    ...recalculateCostResultsByCaseId({
      cases,
      costInputsByCaseId: completeCostInputs,
      rosterStagingByCaseId,
      baseInfoByCaseId,
      capacityResultsByCaseId,
      floorEfficiencyResultsByCaseId,
    }),
  };

  return {
    costInputsByCaseId: completeCostInputs,
    costResultsByCaseId: completeCostResults,
  };
}

function recordsHaveSameData(leftRecord, rightRecord) {
  return JSON.stringify(leftRecord ?? {}) === JSON.stringify(rightRecord ?? {});
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
    calculationStatus: canCalculate ? "可進行初步試算" : `尚缺：${missingItems.join("、")}`,
    missingItems,
    formulaStatus: "初步試算公式",
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
    calculationStatus: canCalculate ? "可依坪效模型初算" : `尚缺：${missingItems.join("、")}`,
    missingItems,
    formulaStatus: "初步坪效模型",
    formulaSource: "坪效計算表(1).xlsx",
  }, INTERNAL_DECIMAL_DIGITS);
}

function RosterUploadTesting({ currentCase, preview, onPreviewChange }) {
  const pdfFileInputRef = useRef(null);
  const rosterFileInputRef = useRef(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfStatus, setPdfStatus] = useState(null);
  const [fileName, setFileName] = useState("");
  const [draftPreview, setDraftPreview] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [rosterMessage, setRosterMessage] = useState("");
  const [importMode, setImportMode] = useState("replace");
  const [columnMappingDraft, setColumnMappingDraft] = useState(null);
  const pdfFileInputId = `roster-pdf-file-${currentCase.id}`;
  const fileInputId = `roster-upload-file-${currentCase.id}`;
  const activePreview = draftPreview || preview;
  const displayFileName = fileName || activePreview?.fileName || "";
  const existingLandRows = getRosterLandRows(preview);
  const existingBuildingRows = getRosterBuildingRows(preview);
  const hasExistingRoster = Boolean(preview) && (existingLandRows.length > 0 || existingBuildingRows.length > 0);
  const selectedImportMode = rosterImportModeOptions.find((option) => option.value === importMode);

  const handlePdfFileChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    const selectedFileNames = files.map((file) => file.name).join(" + ");
    setPdfFileName(selectedFileNames);
    setPdfStatus(null);
    setColumnMappingDraft(null);
    setParseError("");
    setRosterMessage("");

    if (!files.length) {
      setPdfStatus({
        type: "error",
        title: "尚未選擇 PDF",
        message: "請選擇可複製文字的電子謄本 PDF。",
      });
      return;
    }

    if (files.some((file) => !file.name.toLowerCase().endsWith(".pdf"))) {
      setPdfStatus({
        type: "error",
        title: "檔案格式不支援",
        message: "PDF 解析流程只接受 .pdf 檔案；若已有整理好的 Excel 清冊，可使用下方 Excel 上傳並確認欄位對應。",
      });
      event.target.value = "";
      return;
    }

    setFileName(selectedFileNames);
    setDraftPreview(null);
    setImportMode(hasExistingRoster ? "" : "replace");
    setIsParsing(true);
    setPdfStatus({
      type: "notice",
      title: "檢查 PDF 文字層",
      message: "正在讀取 PDF 文字層並解析謄本資料，尚未寫入案件清冊。",
    });

    try {
      const { parseReadableLandRegisterPdfs } = await import("./rosterPdfParser.js");
      const parsedPdf = await parseReadableLandRegisterPdfs(files);
      const rosterPreview = buildRosterPreviewFromPdfResult(parsedPdf);
      setDraftPreview({
        ...rosterPreview,
        sourceFlow: "readable-pdf",
        pendingConfirmation: true,
      });
      setPdfStatus({
        type: "notice",
        title: "已建立 PDF 清冊草稿",
        message: `已解析 ${parsedPdf.sources.length} 份 PDF、${rosterPreview.landRights.length} 筆土地權利列。請先預覽、下載清冊並人工確認後再匯入。`,
      });
      setRosterMessage(hasExistingRoster
        ? "目前案件已有清冊，請先選擇匯入模式；確認前不會覆蓋既有案件清冊。"
        : "PDF 已建立清冊草稿，確認前不會寫入案件清冊。");
    } catch (error) {
      const isParserError = error?.name === "RosterPdfParserError";
      setPdfStatus({
        type: "error",
        title: isParserError && error.code === "NO_TEXT_LAYER" ? "掃描 PDF 尚無法解析" : "PDF 解析未完成",
        message: error instanceof Error
          ? error.message
          : "無法解析 PDF 文字層時，可改上傳已整理的 Excel 清冊；欄位格式不同時系統會引導確認對應。",
      });
      setFileName("");
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    setParseError("");
    setRosterMessage("");
    setPdfStatus(null);
    setColumnMappingDraft(null);

    if (!file) {
      setParseError("尚未選擇清冊檔案。");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setParseError("目前清冊上傳測試只接受 .xlsx 檔案。");
      event.target.value = "";
      return;
    }

    setDraftPreview(null);
    setImportMode(hasExistingRoster ? "" : "replace");
    setIsParsing(true);
    try {
      const workbookData = await parseRosterWorkbook(file);
      if (!workbookData.sheetSelection.land) {
        setParseError("這份清冊的欄位格式與系統模板不同，且目前找不到可辨識的土地清冊工作表。請確認檔案內容或重新選檔。");
        return;
      }

      if (workbookData.needsColumnMapping) {
        setColumnMappingDraft({
          file,
          fileName: file.name,
          workbookData,
        });
        setRosterMessage("系統已讀取到清冊資料，但有些欄位需要您確認對應。");
        return;
      }

      const rosterPreview = buildRosterPreview(file, workbookData);
      setDraftPreview({
        ...rosterPreview,
        sourceFlow: "xlsx-upload",
        pendingConfirmation: true,
      });
      const shareAreaMessage = getRosterPreviewShareAreaMessage(rosterPreview);
      setRosterMessage(hasExistingRoster
        ? [shareAreaMessage, "目前案件已有清冊，請先選擇匯入模式；確認前不會覆蓋既有案件清冊。"].filter(Boolean).join(" ")
        : shareAreaMessage);
      if (!rosterPreview.landRights.length) {
        setParseError("解析結果為 0 筆有效土地權利列。這份清冊可能需要確認欄位對應，或檢查是否已填寫地號、所有權人與權利範圍。");
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "清冊解析失敗，請確認檔案是否為標準 .xlsx。");
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const handleCancelColumnMapping = () => {
    setColumnMappingDraft(null);
    setRosterMessage("");
  };

  const handleReselectColumnMappingFile = () => {
    setColumnMappingDraft(null);
    setRosterMessage("");
    rosterFileInputRef.current?.click();
  };

  const handleBuildPreviewFromColumnMapping = (mappingByType) => {
    if (!columnMappingDraft) {
      return;
    }

    const workbookData = buildRosterWorkbookDataFromMapping(columnMappingDraft.workbookData, mappingByType);
    const rosterPreview = buildRosterPreview(columnMappingDraft.file, workbookData);
    setDraftPreview({
      ...rosterPreview,
      sourceFlow: "xlsx-upload",
      pendingConfirmation: true,
    });
    setColumnMappingDraft(null);
    setRosterMessage(getRosterPreviewShareAreaMessage(
      rosterPreview,
      "已依確認的欄位對應建立清冊預覽；確認匯入前不會寫入案件資料。",
    ));
    if (!rosterPreview.landRights.length) {
      setParseError("解析結果為 0 筆有效土地權利列，請再確認欄位對應或原始清冊內容。");
    }
  };

  const handleConfirmDraft = () => {
    if (!draftPreview) {
      return;
    }

    if (hasExistingRoster && !selectedImportMode) {
      setParseError("目前案件已有清冊，請先選擇匯入模式後再確認。");
      return;
    }

    if (hasExistingRoster && selectedImportMode?.value === "replace") {
      const confirmed = window.confirm("此操作會以本次清冊取代目前案件清冊，原清冊會保留在版本紀錄中。是否確認取代？");
      if (!confirmed) {
        return;
      }
    }

    const now = new Date().toLocaleString("zh-TW", { hour12: false });
    const sourceFilename = draftPreview.fileName || fileName || displayFileName;
    const sourceType = getRosterPreviewSourceType(draftPreview);
    const result = hasExistingRoster
      ? applyRosterReimportMode(preview, draftPreview, selectedImportMode.value, sourceFilename)
      : {
        roster: createRosterStagingFromRows({
          baseRoster: draftPreview,
          landRows: getRosterLandRows(draftPreview).map((row) => ({
            ...row,
            rowStatus: "imported",
            sourceType: row.sourceType || sourceType,
            sourceFilename: row.sourceFilename || sourceFilename,
            importedAt: row.importedAt || now,
            updatedAt: now,
          })),
          buildingRows: getRosterBuildingRows(draftPreview).map((row) => ({
            ...row,
            rowStatus: "imported",
            sourceType: row.sourceType || sourceType,
            sourceFilename: row.sourceFilename || sourceFilename,
            importedAt: row.importedAt || now,
            updatedAt: now,
          })),
          action: "initial-import",
          sourceFilename,
          fileName: sourceFilename,
        }),
        message: "已確認匯入本案件清冊。",
      };

    onPreviewChange({
      ...result.roster,
      pendingConfirmation: false,
      confirmedAt: now,
      importMode: selectedImportMode?.value || "replace",
      importModeLabel: selectedImportMode?.label || "取代目前清冊",
    });
    setDraftPreview(null);
    setImportMode("replace");
    setRosterMessage(result.message || `已確認匯入本案件清冊（${selectedImportMode?.label || "取代目前清冊"}）。`);
  };

  const handleDownloadPreviewWorkbook = () => {
    if (!activePreview) {
      return;
    }

    try {
      downloadBlobFile(createRosterWorkbookBlob(activePreview), buildGeneratedRosterFileName(currentCase, "xlsx"));
    } catch (error) {
      downloadJsonFile(activePreview, buildGeneratedRosterFileName(currentCase, "json"));
      setRosterMessage("generated Excel 下載暫時失敗，已改下載 draft JSON。");
    }
  };

  const handleDownloadBlankRosterTemplate = () => {
    downloadBlobFile(createBlankRosterTemplateWorkbookBlob(), ROSTER_TEMPLATE_DOWNLOAD_FILENAME);
    setRosterMessage("已產生三策都更清冊標準空白表單；可填寫後上傳建立預覽。");
  };

  const summaryCards = activePreview ? [
    ["狀態", draftPreview ? "待確認匯入" : "已寫入案件暫存"],
    ["匯入批次", activePreview.batchId],
    ["檔案名稱", activePreview.fileName],
    ["匯入時間", activePreview.importedAt],
    ["土地清冊筆數", activePreview.summary.landCount],
    ["建物清冊筆數", activePreview.summary.buildingCount],
    ["疑似權利人群組數", activePreview.summary.partyCount],
    ["涉及地號數", activePreview.summary.landNumberCount],
    ["定位不足 / 待補地籍", activePreview.summary.fallbackLandIdentityCount ?? 0],
    ["地籍定位", activePreview.summary.cadastralLocationDisplay || "待清冊補齊"],
    ["權利範圍完整列數", activePreview.summary.completeShareRows ?? 0],
    ["持分面積可驗算列數", activePreview.summary.verifiableShareAreaRows ?? 0],
    ["持分面積一致列數", activePreview.summary.consistentShareAreaRows ?? 0],
    ["持分面積警告列數", activePreview.summary.shareAreaWarningRows ?? 0],
    ["分母缺漏列數", activePreview.summary.missingShareDenominatorRows ?? 0],
    ["疑似欄位錯置列數", activePreview.summary.suspectedMisalignedShareAreaRows ?? 0],
    ["他項權利資料列數", activePreview.summary.otherRightsRowCount ?? 0],
    ["涉及建號數", activePreview.summary.buildingNumberCount],
    ["疑似同姓多地號群組", activePreview.summary.sameNameMultiLandCount],
    ["疑似同姓多建號群組", activePreview.summary.sameNameMultiBuildingCount],
    ["待人工確認筆數", activePreview.summary.manualReviewCount],
    ["檢核警示數", activePreview.summary.warningCount],
  ] : [];

  return (
    <section className="eval-roster-upload-test">
      <RosterColumnMappingModal
        mappingDraft={columnMappingDraft}
        onCancel={handleCancelColumnMapping}
        onReselect={handleReselectColumnMappingFile}
        onBuildPreview={handleBuildPreviewFromColumnMapping}
      />
      <section className="eval-module-section eval-roster-lifecycle">
        <div className="eval-section-head">
          <h4>清冊建立與維護流程</h4>
          <p>清冊先建立草稿並人工確認，後續補件、年度地價更新與版本紀錄會接續保留來源脈絡。</p>
        </div>
        <ol>
          {[
            "建立清冊草稿",
            "預覽清冊與檢核摘要",
            "人工確認後寫入案件清冊",
            "後續新增、修改、補件更新",
            "年度公告現值 / 申報地價更新",
            "版本紀錄與來源紀錄",
          ].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="eval-roster-official-flow">
        <section className="eval-module-section eval-roster-flow-card">
          <div className="eval-section-head">
            <h4>上傳可讀電子謄本 PDF</h4>
            <p>請上傳可複製文字的電子謄本 PDF。系統會解析文字層並建立清冊草稿；掃描影像 PDF 暫不支援。</p>
          </div>
          <input
            ref={pdfFileInputRef}
            id={pdfFileInputId}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handlePdfFileChange}
            className="eval-roster-file-input"
          />
          <div className="eval-roster-flow-actions">
            <button type="button" onClick={() => pdfFileInputRef.current?.click()} disabled={isParsing}>
              上傳並解析 PDF
            </button>
            <span>{pdfFileName || "尚未選擇 PDF"}</span>
          </div>
          <p className="eval-roster-helper">
            僅支援有文字層的電子謄本；掃描 PDF、照片、截圖與 OCR 暫不進入正式清冊建立。
          </p>
          <div className="eval-roster-template-steps" aria-label="PDF 清冊建立流程">
            {["檢查 PDF 文字層", "解析謄本文字", "建立清冊草稿", "顯示預覽", "下載系統產生清冊 Excel", "確認匯入本案件清冊"].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
          {pdfStatus && (
            <div className={`eval-roster-gate-message eval-roster-gate-message--${pdfStatus.type}`}>
              <strong>{pdfStatus.title}</strong>
              <p>{pdfStatus.message}</p>
            </div>
          )}
        </section>

        <section className="eval-module-section eval-roster-flow-card">
          <div className="eval-section-head">
            <h4>上傳已整理清冊 Excel</h4>
            <p>可使用三策都更清冊標準表單，也可上傳由謄本整理出的土地 / 建物權屬清冊。系統會先辨識欄位並建立預覽，確認後才寫入目前案件。</p>
          </div>
          <input
            ref={rosterFileInputRef}
            id={fileInputId}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="eval-roster-file-input"
          />
          <div className="eval-roster-flow-actions">
            <button type="button" onClick={handleDownloadBlankRosterTemplate}>
              下載都更清冊空白表單
            </button>
            <button type="button" onClick={() => rosterFileInputRef.current?.click()}>
              上傳已填寫清冊
            </button>
          </div>
          <p className="eval-roster-helper">
            系統以都更權屬清冊標準格式為主要欄位；舊版 v7 清冊仍可相容匯入，但不再作為主要模板。
          </p>
          <div className="eval-roster-template-steps" aria-label="清冊建立流程">
            {["下載空白表單", "填寫清冊", "上傳清冊", "預覽與檢核", "確認匯入本案件清冊"].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </section>
      </div>

      <section className="eval-module-section eval-roster-upload-card">
        <div className="eval-section-head">
            <h4>清冊建立狀態</h4>
          <p>可讀電子謄本 PDF、三策都更清冊標準表單或已整理 Excel 清冊都會先建立草稿。上傳後系統會顯示預覽與檢核摘要，確認後才寫入案件資料。</p>
        </div>
        <div className="eval-roster-upload-controls">
          <div className="eval-roster-file-picker">
            <label htmlFor={fileInputId}>目前預覽檔案</label>
            <button type="button" onClick={() => rosterFileInputRef.current?.click()}>
              重新選擇清冊
            </button>
          </div>
          <article>
            <strong>{displayFileName || "尚未選擇檔案"}</strong>
            <p>{draftPreview ? "清冊預覽尚未寫入案件；請確認後再匯入。" : `目前案件：${currentCase.code} / ${currentCase.name}`}</p>
          </article>
        </div>
        {isParsing && <p className="eval-roster-status">正在讀取檔案並建立檢核摘要...</p>}
        {parseError && <p className="eval-auth-error">{parseError}</p>}
        {rosterMessage && <p className="eval-roster-status">{rosterMessage}</p>}
      </section>

      {!activePreview && !isParsing && (
        <section className="eval-module-section eval-roster-empty-state">
          <div className="eval-section-head">
            <h4>尚未建立清冊預覽</h4>
            <p>請上傳已整理的土地 / 建物清冊，系統會先辨識欄位並建立目前案件的清冊草稿。</p>
          </div>
        </section>
      )}

      {activePreview && (
        <>
          <section className="eval-module-section">
            <div className="eval-section-head">
              <h4>清冊預覽與檢核摘要</h4>
              <p>{draftPreview ? "請先人工確認，下方按鈕確認後才會寫入本案件清冊暫存。" : "目前案件的清冊暫存解析結果。"}</p>
            </div>
            <div className="eval-roster-summary-grid eval-roster-summary-grid--wide">
              {summaryCards.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
            {draftPreview && (
              <>
                {activePreview.columnMappingSummary && (
                  <div className="eval-roster-column-preview-summary">
                    <strong>欄位對應摘要</strong>
                    <p>
                      土地：{activePreview.columnMappingSummary.land?.sheetName || "未辨識"}；
                      建物：{activePreview.columnMappingSummary.building?.sheetName || "未辨識"}。
                      {activePreview.columnMappingWarnings?.length
                        ? `提醒：${activePreview.columnMappingWarnings.join("、")}`
                        : "系統已依目前欄位對應建立預覽。"}
                    </p>
                  </div>
                )}
                {hasExistingRoster && (
                  <div className="eval-roster-import-mode">
                    <div>
                      <strong>再次匯入模式</strong>
                      <p>目前案件已有清冊，本次預覽不會直接覆蓋。請先選擇匯入策略。</p>
                    </div>
                    <div className="eval-roster-import-mode-options">
                      {rosterImportModeOptions.map((option) => (
                        <label key={option.value}>
                          <input
                            type="radio"
                            name={`roster-import-mode-${currentCase.id}`}
                            value={option.value}
                            checked={importMode === option.value}
                            onChange={() => setImportMode(option.value)}
                          />
                          <span>
                            <b>{option.label}</b>
                            <small>{option.description}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedImportMode && (
                      <p className="eval-roster-import-mode-reminder">
                        {selectedImportMode.value === "replace" && "將以本次預覽清冊取代目前案件清冊，原清冊會保留到版本紀錄。"}
                        {selectedImportMode.value === "merge" && "將依地籍定位、權利人與持分比對資料，不重複新增相同列；衝突資料會保留人工確認。"}
                        {selectedImportMode.value === "new-version" && "將本次預覽清冊保存為新版本，不影響目前案件清冊。"}
                        {selectedImportMode.value === "land-value-update" && "只更新相同地籍定位的公告現值、申報地價與年度，不變更權利人、面積與持分。"}
                      </p>
                    )}
                  </div>
                )}
                <div className="eval-roster-confirm-bar">
                  <span>
                    {hasExistingRoster
                      ? "確認後依所選模式寫入案件清冊；未選擇模式前不會覆蓋既有資料。"
                      : `確認後將寫入 rosterStagingByCaseId[${currentCase.id}]。`}
                  </span>
                  <div className="eval-roster-confirm-actions">
                    <button type="button" onClick={handleDownloadPreviewWorkbook}>
                      下載系統產生清冊 Excel
                    </button>
                    <button type="button" onClick={handleConfirmDraft} disabled={hasExistingRoster && !selectedImportMode}>
                      確認匯入本案件清冊
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <RosterPreviewTable
            title="土地權利明細預覽"
            description="每一筆土地權利列保留原始資料，不自動合併。"
            emptyText="目前未讀到土地清冊資料。"
            columns={[
              ...LAND_PREVIEW_COLUMNS,
            ]}
            rows={activePreview.landRights}
          />

          <RosterPreviewTable
            title="建物權利明細預覽"
            description="顯示建物權利列；無有效資料時顯示空狀態。"
            emptyText="目前未讀到建物清冊資料。"
            columns={[
              ...BUILDING_PREVIEW_COLUMNS,
            ]}
            rows={activePreview.buildingRights}
          />

          <RosterPreviewTable
            title="疑似權利人群組總表"
            description="PG-* 為疑似群組，正式歸戶仍需完整資料或人工確認。"
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
            rows={activePreview.partyRows}
          />

          <section className="eval-module-section">
            <div className="eval-section-head">
              <h4>待人工確認清單</h4>
              <p>以下項目不阻擋匯入暫存，但正式套用前必須人工確認。</p>
            </div>
            {activePreview.issues.length ? (
              <div className="eval-roster-issue-list eval-roster-issue-scroll">
                {activePreview.issues.map((issue, issueIndex) => (
                  <article key={`${issue.id}-${issueIndex}`}>
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

        </>
      )}
    </section>
  );
}

function RosterMaintenancePanel({ currentCase, rosterStaging, onRosterStagingChange, onMarkUnsaved }) {
  const normalizedRoster = useMemo(() => normalizeRosterStaging(rosterStaging) || createEmptyRosterRecord("manual"), [rosterStaging]);
  const landRows = useMemo(() => getRosterLandRows(normalizedRoster), [normalizedRoster]);
  const buildingRows = useMemo(() => getRosterBuildingRows(normalizedRoster), [normalizedRoster]);
  const rosterSummary = buildRosterBaseSummary(normalizedRoster);
  const hasRosterRows = landRows.length > 0 || buildingRows.length > 0;
  const [activeAction, setActiveAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [landForm, setLandForm] = useState({
    city: "",
    district: "",
    section: "",
    subsection: "",
    lotNumber: "",
    landAreaSqm: "",
    announcedCurrentValue: "",
    announcedCurrentValueYear: "",
    declaredLandValue: "",
    declaredLandValueYear: "",
    ownerName: "",
    registeredOwnerName: "",
    trusteeName: "",
    trustorName: "",
    ownershipType: "",
    shareNumerator: "1",
    shareDenominator: "1",
    registrationOrder: "",
    registrationReason: "",
    registrationDate: "",
    titleNumber: "",
    notes: "",
  });
  const [buildingForm, setBuildingForm] = useState({
    city: "",
    district: "",
    section: "",
    subsection: "",
    lotNumber: "",
    buildingNumber: "",
    buildingAddress: "",
    ownerName: "",
    registeredOwnerName: "",
    ownershipType: "",
    buildingShareNumerator: "1",
    buildingShareDenominator: "1",
    mainBuildingAreaSqm: "",
    attachedBuildingAreaSqm: "",
    commonAreaSqm: "",
    buildingShareAreaSqm: "",
    registrationReason: "",
    registrationDate: "",
    titleNumber: "",
    notes: "",
  });
  const [supplementState, setSupplementState] = useState({
    fileName: "",
    preview: null,
    analysis: null,
    mode: "add-new",
    status: "",
    error: "",
  });
  const [valueForm, setValueForm] = useState({
    city: "",
    district: "",
    section: "",
    subsection: "",
    lotNumber: "",
    announcedCurrentValue: "",
    announcedCurrentValueYear: "",
    declaredLandValue: "",
    declaredLandValueYear: "",
    notes: "",
  });
  const [valueState, setValueState] = useState({
    fileName: "",
    preview: null,
    mode: "manual",
    updates: [],
    status: "",
    error: "",
  });
  const [reimportState, setReimportState] = useState({
    fileName: "",
    preview: null,
    analysis: null,
    mode: "replace",
    replaceConfirmed: false,
    status: "",
    error: "",
  });

  const updateLandForm = (field, value) => setLandForm((current) => ({ ...current, [field]: value }));
  const updateBuildingForm = (field, value) => setBuildingForm((current) => ({ ...current, [field]: value }));
  const updateValueForm = (field, value) => setValueForm((current) => ({ ...current, [field]: value }));
  const landFormReady = Boolean(
    buildLotIdentityKey(landForm)
      && parseRosterNumber(landForm.landAreaSqm) > 0
      && normalizeCellValue(landForm.ownerName)
      && parseRosterNumber(landForm.shareNumerator) > 0
      && parseRosterNumber(landForm.shareDenominator) > 0,
  );
  const buildingFormReady = Boolean(
    buildLotIdentityKey(buildingForm)
      && normalizeCellValue(buildingForm.buildingNumber)
      && normalizeCellValue(buildingForm.ownerName)
      && parseRosterNumber(buildingForm.buildingShareDenominator) > 0,
  );
  const valueFormReady = Boolean(
    buildLotIdentityKey(valueForm)
      && (
        normalizeCellValue(valueForm.announcedCurrentValue)
        || normalizeCellValue(valueForm.declaredLandValue)
        || normalizeCellValue(valueForm.announcedCurrentValueYear)
        || normalizeCellValue(valueForm.declaredLandValueYear)
      ),
  );

  const maintenanceSummary = [
    ["土地權利列數", rosterSummary.landRightCount],
    ["建物權利列數", rosterSummary.buildingRightCount],
    ["地號數", rosterSummary.landNumberCount],
    ["公告現值年度", rosterSummary.announcedCurrentValueYear],
    ["申報地價年度", rosterSummary.declaredLandValueYear],
    ["最近匯入時間", rosterSummary.importedAt || normalizedRoster.updatedAt || "尚未建立"],
    ["最近資料來源", rosterSummary.latestSource],
    ["版本數量", Array.isArray(normalizedRoster.versionHistory) ? normalizedRoster.versionHistory.length : 0],
  ];

  const openAction = (action) => {
    setActiveAction(action);
    setMessage("");
    setError("");
  };
  const closeAction = () => {
    setActiveAction("");
    setError("");
  };
  const commitRoster = (nextRoster, successMessage) => {
    if (!onRosterStagingChange) {
      setError("目前無法寫入案件清冊。請先確認已建立或選擇案件。");
      return;
    }
    onRosterStagingChange(nextRoster);
    onMarkUnsaved?.();
    setMessage(successMessage);
    setError("");
    setActiveAction("");
  };
  const parseMaintenanceWorkbook = async (file) => {
    const workbookData = await parseRosterWorkbook(file);
    return buildRosterPreview(file, workbookData);
  };
  const handleDownloadCurrentRoster = () => {
    if (!hasRosterRows) {
      setError("目前案件尚無清冊資料，無法下載。");
      return;
    }
    downloadBlobFile(createRosterWorkbookBlob(normalizedRoster), buildCurrentRosterFileName(currentCase));
    setMessage("已產生目前案件清冊 xlsx，可再次依都更清冊標準流程解析。");
    setError("");
  };
  const handleAddLandRow = () => {
    if (!landFormReady) {
      setError("請至少填寫地號、土地面積、所有權人 / 實際權利人與持分分子 / 分母。");
      return;
    }
    const now = new Date().toLocaleString("zh-TW", { hour12: false });
    const landAreaSqm = parseRosterNumber(landForm.landAreaSqm);
    const shareNumerator = normalizeCellValue(landForm.shareNumerator);
    const shareDenominator = normalizeCellValue(landForm.shareDenominator);
    const shareRatio = parseRatio(shareNumerator, shareDenominator);
    const shareAreaSqm = calculateShareArea(landAreaSqm, shareNumerator, shareDenominator);
    const rowId = nextRosterSequenceId(landRows, "LR");
    const announcedCurrentValue = parseRosterNumber(landForm.announcedCurrentValue);
    const announcedCurrentValueSubtotal = Number.isFinite(shareAreaSqm) && Number.isFinite(announcedCurrentValue)
      ? roundForStorage(shareAreaSqm * announcedCurrentValue, INTERNAL_DECIMAL_DIGITS)
      : "";
    const nextLandRows = [
      ...landRows,
      {
        rowId,
        landRightRowId: rowId,
        ownerName: normalizeCellValue(landForm.ownerName),
        registeredOwnerName: normalizeCellValue(landForm.registeredOwnerName),
        trusteeName: normalizeCellValue(landForm.trusteeName),
        trustorName: normalizeCellValue(landForm.trustorName),
        ownershipType: normalizeCellValue(landForm.ownershipType) || "manual",
        city: normalizeLandKeyPart(landForm.city),
        district: normalizeLandKeyPart(landForm.district),
        section: normalizeLandKeyPart(landForm.section),
        subsection: normalizeLandKeyPart(landForm.subsection),
        lotNumber: normalizeLandKeyPart(landForm.lotNumber),
        landNumber: normalizeLandKeyPart(landForm.lotNumber),
        landAreaSqm: roundForStorage(landAreaSqm, INTERNAL_DECIMAL_DIGITS),
        announcedCurrentValue: normalizeCellValue(landForm.announcedCurrentValue),
        announcedCurrentValueYear: normalizeCellValue(landForm.announcedCurrentValueYear),
        declaredLandValue: normalizeCellValue(landForm.declaredLandValue),
        declaredLandValueYear: normalizeCellValue(landForm.declaredLandValueYear),
        shareNumerator,
        shareDenominator,
        shareRatio: roundForStorage(shareRatio, INTERNAL_DECIMAL_DIGITS),
        shareAreaSqm: roundForStorage(shareAreaSqm, INTERNAL_DECIMAL_DIGITS),
        shareAreaPing: roundForStorage(sqmToPing(shareAreaSqm), INTERNAL_DECIMAL_DIGITS),
        announcedCurrentValueSubtotal,
        registrationOrder: normalizeCellValue(landForm.registrationOrder),
        registrationReason: normalizeCellValue(landForm.registrationReason),
        registrationDate: normalizeCellValue(landForm.registrationDate),
        titleNumber: normalizeCellValue(landForm.titleNumber),
        sourceType: "manual",
        sourceFilename: "manual",
        importedAt: now,
        updatedAt: now,
        rowStatus: "added",
        notes: normalizeCellValue(landForm.notes),
      },
    ];
    commitRoster(createRosterStagingFromRows({
      baseRoster: normalizedRoster,
      landRows: nextLandRows,
      buildingRows,
      action: "manual-add-land-row",
      sourceFilename: "manual",
    }), "已新增土地權利列，清冊摘要與疑似權利人分組已重新計算。");
  };
  const handleAddBuildingRow = () => {
    if (!buildingFormReady) {
      setError("請至少填寫地號、建號、所有權人 / 實際權利人與建物權利範圍分母。");
      return;
    }
    const now = new Date().toLocaleString("zh-TW", { hour12: false });
    const rowId = nextRosterSequenceId(buildingRows, "BR");
    const buildingShareRatio = parseRatio(buildingForm.buildingShareNumerator, buildingForm.buildingShareDenominator);
    const nextBuildingRows = [
      ...buildingRows,
      {
        rowId,
        buildingRightRowId: rowId,
        city: normalizeLandKeyPart(buildingForm.city),
        district: normalizeLandKeyPart(buildingForm.district),
        section: normalizeLandKeyPart(buildingForm.section),
        subsection: normalizeLandKeyPart(buildingForm.subsection),
        lotNumber: normalizeLandKeyPart(buildingForm.lotNumber),
        relatedLandNumber: normalizeLandKeyPart(buildingForm.lotNumber),
        buildingNumber: normalizeCellValue(buildingForm.buildingNumber),
        buildingAddress: normalizeCellValue(buildingForm.buildingAddress),
        ownerName: normalizeCellValue(buildingForm.ownerName),
        registeredOwnerName: normalizeCellValue(buildingForm.registeredOwnerName),
        ownershipType: normalizeCellValue(buildingForm.ownershipType) || "manual",
        buildingShareNumerator: normalizeCellValue(buildingForm.buildingShareNumerator),
        buildingShareDenominator: normalizeCellValue(buildingForm.buildingShareDenominator),
        buildingShareRatio: roundForStorage(buildingShareRatio, INTERNAL_DECIMAL_DIGITS),
        mainBuildingAreaSqm: roundForStorage(parseRosterNumber(buildingForm.mainBuildingAreaSqm), INTERNAL_DECIMAL_DIGITS),
        attachedBuildingAreaSqm: roundForStorage(parseRosterNumber(buildingForm.attachedBuildingAreaSqm), INTERNAL_DECIMAL_DIGITS),
        commonAreaSqm: roundForStorage(parseRosterNumber(buildingForm.commonAreaSqm), INTERNAL_DECIMAL_DIGITS),
        buildingShareAreaSqm: roundForStorage(parseRosterNumber(buildingForm.buildingShareAreaSqm), INTERNAL_DECIMAL_DIGITS),
        registrationReason: normalizeCellValue(buildingForm.registrationReason),
        registrationDate: normalizeCellValue(buildingForm.registrationDate),
        titleNumber: normalizeCellValue(buildingForm.titleNumber),
        sourceType: "manual",
        sourceFilename: "manual",
        importedAt: now,
        updatedAt: now,
        rowStatus: "added",
        notes: normalizeCellValue(buildingForm.notes),
      },
    ];
    commitRoster(createRosterStagingFromRows({
      baseRoster: normalizedRoster,
      landRows,
      buildingRows: nextBuildingRows,
      action: "manual-add-building-row",
      sourceFilename: "manual",
    }), "已新增建物權利列，建物列數已更新。");
  };
  const handleSupplementFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSupplementState((current) => ({ ...current, fileName: file.name, status: "解析中...", error: "", preview: null, analysis: null }));
    try {
      const preview = await parseMaintenanceWorkbook(file);
      const analysis = analyzeRosterSupplement(normalizedRoster, preview);
      setSupplementState((current) => ({ ...current, fileName: file.name, preview, analysis, status: "已建立補充資料預覽", error: "" }));
    } catch (parseError) {
      setSupplementState((current) => ({ ...current, status: "", error: parseError?.message || "補充資料解析失敗，請確認是否為都更權屬清冊標準格式或相容舊版清冊 xlsx。" }));
    }
  };
  const handleConfirmSupplement = () => {
    if (!supplementState.preview) {
      setError("請先選擇並解析補充資料清冊。");
      return;
    }
    const { roster, analysis } = applySupplementalImport(normalizedRoster, supplementState.preview, supplementState.mode);
    const addedCount = analysis.newLandRows.length + analysis.newBuildingRows.length;
    const updatedCount = supplementState.mode === "merge-update" ? analysis.updateLandRows.length + analysis.updateBuildingRows.length : 0;
    commitRoster(roster, supplementState.mode === "review-only"
      ? "補充資料已列入人工確認，尚未寫入土地或建物列。"
      : `補充資料已套用，新增 ${addedCount} 筆、更新 ${updatedCount} 筆。`);
  };
  const handleValueFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValueState((current) => ({ ...current, fileName: file.name, status: "解析中...", error: "", preview: null, updates: [] }));
    try {
      const preview = await parseMaintenanceWorkbook(file);
      const updates = getRosterLandRows(preview)
        .map((row) => ({
          city: row.city,
          district: row.district,
          section: row.section,
          subsection: row.subsection,
          lotNumber: row.lotNumber || row.landNumber,
          lotIdentityKey: buildLotIdentityKey(row),
          landDisplayLabel: getLandDisplayLabel(row),
          announcedCurrentValue: row.announcedCurrentValue,
          announcedCurrentValueYear: row.announcedCurrentValueYear,
          declaredLandValue: row.declaredLandValue,
          declaredLandValueYear: row.declaredLandValueYear,
          sourceFilename: file.name,
          notes: "由新版清冊比對地價更新",
        }))
        .filter((row) => buildLotIdentityKey(row) && (
          normalizeCellValue(row.announcedCurrentValue)
          || normalizeCellValue(row.announcedCurrentValueYear)
          || normalizeCellValue(row.declaredLandValue)
          || normalizeCellValue(row.declaredLandValueYear)
        ));
      setValueState((current) => ({ ...current, fileName: file.name, preview, updates, status: `已解析 ${updates.length} 筆可比對地價資料`, error: "" }));
    } catch (parseError) {
      setValueState((current) => ({ ...current, status: "", error: parseError?.message || "新版清冊解析失敗。" }));
    }
  };
  const handleConfirmValueUpdate = () => {
    const updates = valueState.mode === "file"
      ? valueState.updates
      : [{
        ...valueForm,
        lotIdentityKey: buildLotIdentityKey(valueForm),
        landDisplayLabel: getLandDisplayLabel(valueForm),
        sourceFilename: "manual-value-update",
      }];
    if (valueState.mode === "manual" && !valueFormReady) {
      setError("請至少填寫地號，並提供公告現值、申報地價或年度資料。");
      return;
    }
    if (!updates.length) {
      setError("目前沒有可套用的地價更新資料。");
      return;
    }
    const { roster, updatedCount } = applyValueUpdates(normalizedRoster, updates);
    commitRoster(roster, `已套用地價更新 ${updatedCount} 筆；若未更新，請確認縣市 / 行政區 / 段別 / 小段 / 地號是否可比對。`);
  };
  const handleReimportFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setReimportState((current) => ({ ...current, fileName: file.name, status: "解析中...", error: "", preview: null, analysis: null }));
    try {
      const preview = await parseMaintenanceWorkbook(file);
      const analysis = analyzeRosterReimport(normalizedRoster, preview);
      setReimportState((current) => ({ ...current, fileName: file.name, preview, analysis, status: "已建立重新匯入比較", error: "" }));
    } catch (parseError) {
      setReimportState((current) => ({ ...current, status: "", error: parseError?.message || "重新匯入清冊解析失敗。" }));
    }
  };
  const handleConfirmReimport = () => {
    if (!reimportState.preview) {
      setError("請先選擇並解析新清冊。");
      return;
    }
    if (reimportState.mode === "replace") {
      if (!reimportState.replaceConfirmed) {
        setError("取代目前清冊前，請勾選二次確認。");
        return;
      }
      const confirmed = window.confirm("此操作會以本次清冊取代目前案件清冊，原清冊會保留在版本紀錄中。是否確認取代？");
      if (!confirmed) {
        return;
      }
    }
    const mode = reimportState.mode === "value-only" ? "land-value-update" : reimportState.mode;
    const { roster, message } = applyRosterReimportMode(normalizedRoster, reimportState.preview, mode, reimportState.fileName);
    commitRoster(roster, message);
  };

  return (
    <section className="eval-module-section eval-roster-maintenance">
      <div className="eval-section-head">
        <h4>清冊維護</h4>
        <p>已寫入案件的清冊會保留來源與列狀態。逐筆新增、補件合併、年度地價更新與清冊版本都可先預覽再套用。</p>
      </div>
      <div className="eval-roster-summary-grid eval-roster-summary-grid--wide">
        {maintenanceSummary.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value === 0 ? 0 : value || "待清冊補齊"}</strong>
          </article>
        ))}
      </div>
      <div className="eval-roster-maintenance-actions">
        <button type="button" onClick={() => openAction("add-land")}>新增土地權利列</button>
        <button type="button" onClick={() => openAction("add-building")}>新增建物權利列</button>
        <button type="button" onClick={() => openAction("supplement")}>匯入補充資料</button>
        <button type="button" onClick={() => openAction("values")}>更新公告現值 / 申報地價</button>
        <button type="button" onClick={handleDownloadCurrentRoster} disabled={!hasRosterRows}>下載目前案件清冊</button>
        <button type="button" onClick={() => openAction("reimport")}>重新匯入清冊</button>
      </div>
      {!hasRosterRows && (
        <p className="eval-roster-maintenance-hint">目前案件尚無清冊資料；可先新增土地 / 建物權利列，或從上方清冊建立流程匯入。</p>
      )}
      {message && <p className="eval-inline-success">{message}</p>}
      {error && <p className="eval-inline-error">{error}</p>}
      <div className="eval-roster-gate-message eval-roster-gate-message--notice">
        <strong>年度地價維護架構</strong>
        <p>
          後續上傳新年度謄本或清冊時，系統會以縣市、行政區、段別、小段與地號比對；若僅公告現值或申報地價不同，將標示為地價年度更新並要求人工確認。
        </p>
      </div>

      {activeAction === "add-land" && (
        <RosterMaintenanceDialog title="新增土地權利列" onClose={closeAction}>
          <RosterMaintenanceFormGrid>
            {[
              ["縣市", "city"],
              ["行政區", "district"],
              ["段別", "section"],
              ["小段", "subsection"],
              ["地號", "lotNumber"],
              ["土地面積㎡", "landAreaSqm"],
              ["公告土地現值", "announcedCurrentValue"],
              ["公告現值年度", "announcedCurrentValueYear"],
              ["申報地價", "declaredLandValue"],
              ["申報地價年度", "declaredLandValueYear"],
              ["所有權人 / 實際權利人", "ownerName"],
              ["登記名義人", "registeredOwnerName"],
              ["受託人", "trusteeName"],
              ["委託人", "trustorName"],
              ["權利型態", "ownershipType"],
              ["持分分子", "shareNumerator"],
              ["持分分母", "shareDenominator"],
              ["登記次序", "registrationOrder"],
              ["登記原因", "registrationReason"],
              ["登記日期", "registrationDate"],
              ["權狀字號", "titleNumber"],
            ].map(([label, field]) => (
              <RosterMaintenanceInput key={field} label={label} value={landForm[field]} onChange={(value) => updateLandForm(field, value)} />
            ))}
            <RosterMaintenanceInput label="備註" value={landForm.notes} onChange={(value) => updateLandForm("notes", value)} wide multiline />
          </RosterMaintenanceFormGrid>
          {!landFormReady && <p className="eval-roster-maintenance-hint">請至少填寫地號、土地面積、所有權人 / 實際權利人與持分分子 / 分母。</p>}
          <RosterMaintenanceDialogActions onCancel={closeAction} onConfirm={handleAddLandRow} confirmLabel="新增土地權利列" disabled={!landFormReady} />
        </RosterMaintenanceDialog>
      )}

      {activeAction === "add-building" && (
        <RosterMaintenanceDialog title="新增建物權利列" onClose={closeAction}>
          <RosterMaintenanceFormGrid>
            {[
              ["縣市", "city"],
              ["行政區", "district"],
              ["段別", "section"],
              ["小段", "subsection"],
              ["地號", "lotNumber"],
              ["建號", "buildingNumber"],
              ["建物門牌", "buildingAddress"],
              ["所有權人 / 實際權利人", "ownerName"],
              ["登記名義人", "registeredOwnerName"],
              ["權利型態", "ownershipType"],
              ["建物權利範圍分子", "buildingShareNumerator"],
              ["建物權利範圍分母", "buildingShareDenominator"],
              ["主建物面積㎡", "mainBuildingAreaSqm"],
              ["附屬建物面積㎡", "attachedBuildingAreaSqm"],
              ["共有部分面積㎡", "commonAreaSqm"],
              ["建物持分面積㎡", "buildingShareAreaSqm"],
              ["登記原因", "registrationReason"],
              ["登記日期", "registrationDate"],
              ["權狀字號", "titleNumber"],
            ].map(([label, field]) => (
              <RosterMaintenanceInput key={field} label={label} value={buildingForm[field]} onChange={(value) => updateBuildingForm(field, value)} />
            ))}
            <RosterMaintenanceInput label="備註" value={buildingForm.notes} onChange={(value) => updateBuildingForm("notes", value)} wide multiline />
          </RosterMaintenanceFormGrid>
          {!buildingFormReady && <p className="eval-roster-maintenance-hint">請至少填寫地號、建號、所有權人 / 實際權利人與建物權利範圍分母。</p>}
          <RosterMaintenanceDialogActions onCancel={closeAction} onConfirm={handleAddBuildingRow} confirmLabel="新增建物權利列" disabled={!buildingFormReady} />
        </RosterMaintenanceDialog>
      )}

      {activeAction === "supplement" && (
        <RosterMaintenanceDialog title="匯入補充資料" onClose={closeAction}>
          <p>請上傳都更權屬清冊標準表單或系統產生 xlsx。舊版 v7 清冊仍可相容匯入；其他 Excel 若無法對應欄位，會先列為人工確認，不直接合併。</p>
          <input type="file" accept=".xlsx,.xls" onChange={handleSupplementFileChange} />
          {supplementState.status && <p className="eval-roster-maintenance-hint">{supplementState.status}</p>}
          {supplementState.error && <p className="eval-inline-error">{supplementState.error}</p>}
          <RosterMaintenanceAnalysis analysis={supplementState.analysis} />
          <RosterMaintenanceOptionGroup
            label="匯入模式"
            value={supplementState.mode}
            onChange={(value) => setSupplementState((current) => ({ ...current, mode: value }))}
            options={[
              ["add-new", "只新增不存在資料"],
              ["merge-update", "更新相同地籍定位 / 相同權利人資料"],
              ["review-only", "全部列入人工確認，不寫入"],
            ]}
          />
          <RosterMaintenanceDialogActions onCancel={closeAction} onConfirm={handleConfirmSupplement} confirmLabel="確認套用補充資料" disabled={!supplementState.preview} />
        </RosterMaintenanceDialog>
      )}

      {activeAction === "values" && (
        <RosterMaintenanceDialog title="更新公告現值 / 申報地價" onClose={closeAction}>
          <RosterMaintenanceOptionGroup
            label="更新方式"
            value={valueState.mode}
            onChange={(value) => setValueState((current) => ({ ...current, mode: value }))}
            options={[
              ["manual", "手動批次更新"],
              ["file", "上傳新版權屬清冊比對地價"],
            ]}
          />
          {valueState.mode === "manual" ? (
            <>
              <RosterMaintenanceFormGrid>
                {[
                  ["縣市", "city"],
                  ["行政區", "district"],
                  ["段別", "section"],
                  ["小段", "subsection"],
                  ["地號", "lotNumber"],
                  ["新公告土地現值", "announcedCurrentValue"],
                  ["公告現值年度", "announcedCurrentValueYear"],
                  ["新申報地價", "declaredLandValue"],
                  ["申報地價年度", "declaredLandValueYear"],
                ].map(([label, field]) => (
                  <RosterMaintenanceInput key={field} label={label} value={valueForm[field]} onChange={(value) => updateValueForm(field, value)} />
                ))}
                <RosterMaintenanceInput label="備註" value={valueForm.notes} onChange={(value) => updateValueForm("notes", value)} wide multiline />
              </RosterMaintenanceFormGrid>
              {!valueFormReady && <p className="eval-roster-maintenance-hint">請填寫地號，並提供公告現值、申報地價或年度資料。</p>}
            </>
          ) : (
            <>
              <input type="file" accept=".xlsx,.xls" onChange={handleValueFileChange} />
              {valueState.status && <p className="eval-roster-maintenance-hint">{valueState.status}</p>}
              {valueState.error && <p className="eval-inline-error">{valueState.error}</p>}
            </>
          )}
          <RosterMaintenanceDialogActions
            onCancel={closeAction}
            onConfirm={handleConfirmValueUpdate}
            confirmLabel="確認更新地價"
            disabled={valueState.mode === "manual" ? !valueFormReady : !valueState.updates.length}
          />
        </RosterMaintenanceDialog>
      )}

      {activeAction === "reimport" && (
        <RosterMaintenanceDialog title="重新匯入清冊" onClose={closeAction}>
          <p>重新匯入會先解析並顯示比較。取代目前清冊需要二次確認，其他模式會保留版本紀錄或只更新指定資料。</p>
          <input type="file" accept=".xlsx,.xls" onChange={handleReimportFileChange} />
          {reimportState.status && <p className="eval-roster-maintenance-hint">{reimportState.status}</p>}
          {reimportState.error && <p className="eval-inline-error">{reimportState.error}</p>}
          <RosterMaintenanceAnalysis analysis={reimportState.analysis} />
          <RosterMaintenanceOptionGroup
            label="重新匯入模式"
            value={reimportState.mode}
            onChange={(value) => setReimportState((current) => ({ ...current, mode: value, replaceConfirmed: false }))}
            options={[
              ["replace", "取代目前清冊", "以本次預覽清冊取代目前案件清冊。會保留舊清冊到版本紀錄，需二次確認。"],
              ["merge", "合併到目前清冊", "相同資料不重複新增；差異資料列入衝突或人工確認，不直接覆蓋。"],
              ["new-version", "建立新清冊版本", "不覆蓋目前清冊，將本次預覽清冊保存為新版本。"],
              ["value-only", "只更新公告現值 / 申報地價", "只更新相同地籍定位的公告現值、申報地價與年度，不改權利人、面積與持分。"],
            ]}
          />
          {reimportState.mode === "replace" && (
            <label className="eval-roster-maintenance-check">
              <input
                type="checkbox"
                checked={reimportState.replaceConfirmed}
                onChange={(event) => setReimportState((current) => ({ ...current, replaceConfirmed: event.target.checked }))}
              />
              我確認要取代目前清冊，並將舊清冊保存到版本紀錄。
            </label>
          )}
          <RosterMaintenanceDialogActions
            onCancel={closeAction}
            onConfirm={handleConfirmReimport}
            confirmLabel="確認重新匯入"
            disabled={!reimportState.preview || (reimportState.mode === "replace" && !reimportState.replaceConfirmed)}
          />
        </RosterMaintenanceDialog>
      )}
    </section>
  );
}

function RosterMaintenanceDialog({ title, children, onClose }) {
  return (
    <div className="eval-confirm-backdrop" role="presentation">
      <section className="eval-confirm-dialog eval-roster-maintenance-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="eval-roster-maintenance-dialog-head">
          <h4>{title}</h4>
          <button type="button" onClick={onClose} aria-label="關閉">
            關閉
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function RosterMaintenanceFormGrid({ children }) {
  return <div className="eval-roster-maintenance-form-grid">{children}</div>;
}

function RosterMaintenanceInput({ label, value, onChange, wide = false, multiline = false }) {
  return (
    <label className={`eval-roster-maintenance-field${wide ? " is-wide" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function RosterMaintenanceDialogActions({ onCancel, onConfirm, confirmLabel, disabled = false }) {
  return (
    <div className="eval-roster-maintenance-dialog-actions">
      <button type="button" className="eval-roster-maintenance-secondary" onClick={onCancel}>
        取消
      </button>
      <button type="button" className="eval-roster-maintenance-primary" onClick={onConfirm} disabled={disabled}>
        {confirmLabel}
      </button>
    </div>
  );
}

function RosterMaintenanceOptionGroup({ label, value, onChange, options }) {
  return (
    <fieldset className="eval-roster-maintenance-options">
      <legend>{label}</legend>
      {options.map(([optionValue, optionLabel, optionDescription]) => (
        <label key={optionValue}>
          <input
            type="radio"
            name={label}
            value={optionValue}
            checked={value === optionValue}
            onChange={() => onChange(optionValue)}
          />
          <span>
            <b>{optionLabel}</b>
            {optionDescription && <small>{optionDescription}</small>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function RosterMaintenanceAnalysis({ analysis }) {
  if (!analysis) {
    return null;
  }

  const rows = [
    ["可新增土地列", (analysis.newLandRows ?? []).length],
    ["可更新土地列", (analysis.updateLandRows ?? []).length],
    ["跳過重複土地列", (analysis.duplicateLandRows ?? []).length],
    ["土地衝突列", (analysis.conflictLandRows ?? []).length],
    ["土地待人工確認", (analysis.reviewLandRows ?? []).length],
    ["地價更新候選", (analysis.priceUpdateCandidates ?? []).length],
    ["可新增建物列", (analysis.newBuildingRows ?? []).length],
    ["可更新建物列", (analysis.updateBuildingRows ?? []).length],
    ["跳過重複建物列", (analysis.duplicateBuildingRows ?? []).length],
    ["建物衝突列", (analysis.conflictBuildingRows ?? []).length],
    ["建物待人工確認", (analysis.reviewBuildingRows ?? []).length],
  ];

  return (
    <dl className="eval-roster-maintenance-analysis">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RosterImportVersioning({ config }) {
  if (!config) {
    return null;
  }

  return (
    <details className="eval-module-section eval-roster-future-flow" data-roster-versioning>
      <summary>
        <span>匯入版本流程</span>
        <small>欄位檢核、差異比對與正式套用規則。</small>
      </summary>
      <div className="eval-roster-future-flow__body">
        <p>{config.notice}</p>
        <ol>
          {[
            "建立清冊草稿：可讀電子謄本 PDF 與三策都更權屬清冊上傳後先進入草稿",
            "預覽清冊：土地、建物、地籍定位、權利範圍與人工確認項目先呈現給使用者",
            "確認匯入：按下確認後才寫入目前案件清冊暫存",
            "後續維護：補件匯入、逐筆新增 / 修改、清冊版本與來源紀錄分階段開放",
            "年度地價：公告現值與申報地價更新需比對地籍定位並由使用者確認",
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
    ["土地權利列數", rosterSummary.landRightCount],
    ["建物權利列數", rosterSummary.buildingRightCount],
    ["地籍定位", rosterSummary.cadastralLocationDisplay],
    ["土地面積合計", rosterSummary.landAreaSummary],
    ["公告現值年度", rosterSummary.announcedCurrentValueYear],
    ["申報地價年度", rosterSummary.declaredLandValueYear],
    ["公告現值總額", formatCurrencyTwd(rosterSummary.assessedCurrentValueTotal)],
    ["公告現值加權平均單價", formatCurrencyTwdPerSqm(rosterSummary.assessedCurrentValueWeightedUnit)],
    ["公告現值狀態", rosterSummary.announcedCurrentValueStatus],
  ];

  return (
    <section className="eval-module-section eval-base-roster-summary">
      <div className="eval-section-head">
        <h4>清冊帶入摘要</h4>
        <p>土地面積與公告現值由目前案件清冊帶入，作為基地與容積試算基礎。</p>
      </div>
      <div className="eval-base-summary-grid">
        {summaryItems.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value || "待清冊補齊"}</strong>
          </article>
        ))}
      </div>
      <details className="eval-inline-details">
        <summary>計算方式說明</summary>
        <p>
          土地面積以唯一地籍定位彙整，同一筆土地只計算一次。公告現值總額依各地籍資料面積與公告現值逐筆加總，單價為加權平均；系統內部保留原始精度試算。
        </p>
        <dl>
          <div>
            <dt>地號清單</dt>
            <dd>{rosterSummary.landNumberDisplay}</dd>
          </div>
          <div>
            <dt>來源檔案</dt>
            <dd>{rosterSummary.fileName || "待補資料"}</dd>
          </div>
          <div>
            <dt>匯入時間</dt>
            <dd>{rosterSummary.importedAt || "待補資料"}</dd>
          </div>
        </dl>
      </details>
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
  const capacityFormulaNote = "獎勵、增額與容移均以基準容積量計算。";
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
          <p>承接清冊土地面積與基地條件，作為容積試算基礎。</p>
        </div>
        <DataSummaryGrid items={sourceItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>一、基準容積</h4>
          <p>土地面積乘基準容積率，作為後續獎勵與容移計算基礎。</p>
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
            <details className="eval-inline-details">
              <summary>估算方式</summary>
              <p>接受基地移入容積 = 送出基地土地面積 ×（送出基地公告土地現值 ÷ 接受基地公告土地現值）× 接受基地容積率。正式仍以實際送出基地、公告現值、成交條件與容移審查結果為準。</p>
            </details>
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
            <details className="eval-inline-details">
              <summary>估價備註</summary>
              <div className="eval-reference-grid">
                <span>土地開發分析法：主要</span>
                <span>比較法：參酌</span>
                <span>收益法：暫不列入正式計算</span>
              </div>
              <p>折繳代金需依主管機關估價與審議結果確認，目前不硬寫正式代金公式。</p>
            </details>
          </article>
        </div>
        <div className="eval-capacity-subsection eval-tdr-scoring">
          <h5>容積移轉量體評點檢核（112 年 1 月 1 日以後）</h5>
          <p className="eval-capacity-method-note">前期檢核工具；正式仍須建築師簽證及主管機關審查確認。</p>
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
              </article>
              <article className="eval-capacity-method-card">
                <h5>B. 周邊鄰地建築物現況與公共設施</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="基地境界線最小退縮距離" value={tdrScoring.boundarySetback} options={tdrScoreOptions.boundarySetback} onChange={handleTdrScoringInputChange("boundarySetback")} />
                  <CapacitySelectField label="現況公共設施面積" value={tdrScoring.publicFacilityArea} options={tdrScoreOptions.publicFacilityArea} onChange={handleTdrScoringInputChange("publicFacilityArea")} />
                  <CapacitySelectField label="TOD 規劃距離" value={tdrScoring.todDistance} options={tdrScoreOptions.todDistance} onChange={handleTdrScoringInputChange("todDistance")} />
                </div>
                <DataSummaryGrid items={tdrSurroundingItems} />
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
              </article>
              <article className="eval-capacity-method-card">
                <h5>D. 地面層開放空間</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <CapacitySelectField label="廣場式開放空間比例" value={tdrScoring.plazaOpenSpaceRatio} options={tdrScoreOptions.plazaOpenSpaceRatio} onChange={handleTdrScoringInputChange("plazaOpenSpaceRatio")} />
                  <CapacitySelectField label="沿街步道式開放空間條件" value={tdrScoring.sidewalkOpenSpaceCondition} options={tdrScoreOptions.sidewalkOpenSpaceCondition} onChange={handleTdrScoringInputChange("sidewalkOpenSpaceCondition")} />
                </div>
                <DataSummaryGrid items={tdrOpenSpaceItems} />
                <p className="eval-capacity-method-note">開放空間不得與開放空間獎勵、法定退縮範圍重複計算；正式仍須建築師檢討與簽證。</p>
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
              </article>
              <article className="eval-capacity-method-card">
                <h5>B. 提供環境改善價金</h5>
                <div className="eval-field-grid eval-linked-input-grid">
                  <label className="eval-field">
                    <span>積分數（1 至 8，整數）</span>
                    <input type="text" value={tdrScoring.environmentImprovementScore} onChange={handleTdrScoringInputChange("environmentImprovementScore")} placeholder="例：1" />
                  </label>
                </div>
                <details className="eval-inline-details">
                  <summary>價金試算方式</summary>
                  <p>環境改善價金 = 接受基地面積（㎡）× 接受基地法定容積率 × 1.31 × 20,000 元 × 積分數。正式金額仍以主管機關審查為準。</p>
                </details>
              </article>
              <article className="eval-capacity-method-card">
                <h5>C. 綠色交通</h5>
                <div className="eval-check-grid">
                  <CapacityCheckboxField label="提供公共自行車或公車候車亭（智慧站牌）留設位置及相關設施設備：+1" checked={tdrScoring.greenTransportProvided} onChange={handleTdrScoringCheckboxChange("greenTransportProvided")} />
                  <CapacityCheckboxField label="基準容積外增加容積樓地板面積達 6,000㎡ 以上，需加倍留設" checked={tdrScoring.greenTransportAddedCapacityOver6000} onChange={handleTdrScoringCheckboxChange("greenTransportAddedCapacityOver6000")} />
                </div>
                <p className="eval-capacity-method-note">設施建置及維護費用先顯示 2,000,000 元；若達 6,000㎡ 以上，暫以 4,000,000 元提示，待正式確認。</p>
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
          <p>核心容積結果會提供坪效、成本與銀行報告引用。</p>
        </div>
        <DataSummaryGrid items={resultItems} />
      </section>
      <details className="eval-module-section eval-formula-note eval-collapsible-section">
        <summary>計算方式說明</summary>
        <p>基準容積量 = 土地面積合計 × 基準容積率 / 100；都市更新獎勵、危老獎勵、增額容積、容積移轉與其他獎勵量 = 基準容積量 × 該比例 / 100；總容積量 = 基準容積量 + 各項獎勵 / 增額 / 容移量；總容積率 = 總容積量 ÷ 土地面積合計 × 100。</p>
      </details>
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
        <details className="eval-inline-details">
          <summary>公告現值計算方式</summary>
          <p>公告現值總額依唯一地籍定位逐筆加總；加權平均單價僅供判讀來源基準。後續模組引用時使用內部原始數值。</p>
        </details>
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>容積與獎勵來源摘要</h4>
          <p>承接容積來源與獎勵試算，整理可供坪效模型使用的比例與面積。</p>
        </div>
        <DataSummaryGrid items={capacitySourceItems} />
      </section>
      <MissingDataNotice missingItems={floorResult.missingItems} />
      <details className="eval-module-section eval-linked-module eval-collapsible-section">
        <summary>坪效公式參數</summary>
        <p>預設承接容積模組數值，可依目前案件暫時調整。</p>
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
      </details>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>初步坪效計算結果</h4>
          <p>承接土地面積、建蔽率、基準容積率與容積獎勵條件。</p>
        </div>
        <DataSummaryGrid items={resultItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>銷售面積與公設摘要</h4>
          <p>作為成本、銷售情境與權利分配的下游基礎。</p>
        </div>
        <DataSummaryGrid items={salesItems} />
      </section>
      <section className="eval-module-section eval-linked-module">
        <div className="eval-section-head">
          <h4>車位與地下層摘要</h4>
          <p>地下層、車位與停車面積仍需由建築配置與法規檢核確認。</p>
        </div>
        <DataSummaryGrid items={parkingItems} />
      </section>
      <details className="eval-module-section eval-formula-note eval-collapsible-section">
        <summary>計算方式說明</summary>
        <p>基準容積量 = 土地面積 × 基準容積率；獎勵 / 移轉容積依基準容積量乘各比例；免計容積依允建容積與設備、梯廳、陽台比例推估；地下層面積 = 土地面積 × 地下層面積倍數 × 地下層數；銷售面積 = 允建容積 + 免計 / 屋突 / 地下可攤公設後再乘銷售面積校正比例。</p>
      </details>
    </div>
  );
}

function CostCaseRequiredNotice({ onGoToCases }) {
  return (
    <section className="eval-module-section eval-case-required">
      <LockKeyhole aria-hidden="true" size={30} />
      <div>
        <p className="eval-kicker">CASE REQUIRED</p>
        <h4>請先建立或選擇案件，才能進行成本與共同負擔試算。</h4>
        <p>成本資料會掛在目前案件底下，並承接清冊、基地、容積、坪效與 TDR 評點結果。</p>
        <button type="button" onClick={onGoToCases}>
          前往案件管理
        </button>
      </div>
    </section>
  );
}

function CostTextInput({ label, value, onChange, placeholder = "待填" }) {
  return (
    <label className="eval-cost-mini-field">
      <span>{label}</span>
      <input type="text" value={value ?? ""} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function CostItemInputControls({ definition, input, context, onChange }) {
  if (definition.mode === "manual") {
    return (
      <CostTextInput
        label={`${definition.code} 金額`}
        value={input.amount}
        onChange={onChange("amount")}
        placeholder="例：1000000"
      />
    );
  }

  if (definition.mode === "planningFee") {
    return (
      <div className="eval-cost-mini-grid">
        <span>P1 1,500,000 + P2 3,000,000 + P3 1,500,000</span>
        <CostTextInput label="X 費用" value={input.xFee} onChange={onChange("xFee")} />
        <CostTextInput label="Y 費用" value={input.yFee} onChange={onChange("yFee")} />
        <CostTextInput label="其他項目" value={input.otherFee} onChange={onChange("otherFee")} />
      </div>
    );
  }

  if (definition.mode === "loanInterest") {
    return (
      <div className="eval-cost-mini-grid">
        <CostTextInput label="(1) 基礎金額" value={input.componentOneAmount} onChange={onChange("componentOneAmount")} />
        <CostTextInput label="(2) 基礎金額" value={input.componentTwoAmount} onChange={onChange("componentTwoAmount")} />
        <CostTextInput label="年利率（%）" value={input.annualRate} onChange={onChange("annualRate")} />
        <CostTextInput label="貸款期間（月）" value={input.loanMonths} onChange={onChange("loanMonths")} />
      </div>
    );
  }

  if (definition.mode === "administrativeFee") {
    return (
      <div className="eval-cost-mini-grid">
        <span>公告現值總額：{formatCurrencyTwd(context.rosterSummary.assessedCurrentValueTotal)}</span>
        <CostTextInput label="費率（%）" value={input.rate} onChange={onChange("rate")} />
      </div>
    );
  }

  if (definition.mode === "personnelAdmin") {
    const rate = calculatePersonnelAdminRate(context.rosterSummary.landRightCount || 0, context.rosterSummary.landAreaSqm || 0);
    return <span className="eval-cost-readonly">依產權級別與基地面積自動採 {formatPercentValue(rate)} 上限</span>;
  }

  if (definition.mode === "salesManagement") {
    return (
      <div className="eval-cost-mini-grid">
        <CostTextInput label="實施者獲配價值" value={input.allocationValue} onChange={onChange("allocationValue")} placeholder="例：3000000000" />
        <span>25 億以下部分 6%，25-50 億部分 5.5%，50 億以上部分 5%。</span>
      </div>
    );
  }

  if (definition.mode === "riskManagement") {
    const totalFloorAreaPing = pickNumericValue(
      context.floorResult?.totalFloorAreaPing,
      Number.isFinite(context.floorResult?.totalFloorAreaSqm) ? convertSqmToPing(context.floorResult.totalFloorAreaSqm) : null,
    ) ?? 0;
    const autoRate = calculateRiskManagementRate(context.rosterSummary.landRightCount || 0, totalFloorAreaPing);
    return (
      <div className="eval-cost-mini-grid">
        <span>依產權級別與總樓地板面積自動採 {formatPercentValue(autoRate)} 上限。</span>
        <CostTextInput label="覆寫費率（%）" value={input.rate} onChange={onChange("rate")} placeholder="空白則自動" />
      </div>
    );
  }

  const sourceQuantity = getCostSourceQuantity(definition.quantitySource, context);
  return (
    <div className="eval-cost-mini-grid">
      {definition.selectField && (
        <label className="eval-cost-mini-field">
          <span>{definition.selectLabel}</span>
          <select value={input[definition.selectField] ?? ""} onChange={onChange(definition.selectField)}>
            {definition.selectOptions.map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
      )}
      <CostTextInput
        label={definition.quantityLabel}
        value={input.quantity}
        onChange={onChange("quantity")}
        placeholder={Number.isFinite(sourceQuantity) ? formatNumber(sourceQuantity, 2) : "待填"}
      />
      <CostTextInput
        label={definition.unitPriceLabel}
        value={input.unitPrice}
        onChange={onChange("unitPrice")}
        placeholder="待填"
      />
    </div>
  );
}

function CostCommonItemRow({ definition, input, result, context, onChange, onCheckboxChange }) {
  return (
    <tr className={result?.warning ? "has-warning" : ""}>
      <td>
        <strong>{definition.code} {definition.title}</strong>
        <p>{definition.description}</p>
      </td>
      <td>{definition.formula}</td>
      <td>
        <CostItemInputControls definition={definition} input={input} context={context} onChange={onChange} />
      </td>
      <td>
        <strong>{formatCurrencyTwd(result?.amount)}</strong>
        <span>{result?.status || "待填"}</span>
      </td>
      <td>{definition.basis}</td>
      <td>{definition.evidence}</td>
      <td>
        <label className="eval-check-field eval-check-field--compact">
          <input type="checkbox" checked={Boolean(input.included)} onChange={onCheckboxChange("included")} />
          <span>{input.included ? "列入" : "不列入"}</span>
        </label>
      </td>
      <td>
        <CostTextInput label="備註" value={input.note} onChange={onChange("note")} placeholder="待填" />
        {result?.warning && <p className="eval-cost-warning">{result.warning}</p>}
      </td>
    </tr>
  );
}

function TaipeiDifferenceReference() {
  return (
    <details className="eval-module-section eval-collapsible-section eval-cost-reference">
      <summary>台北市版本差異參考</summary>
      <ul>
        <li>台北市 113 年 10 月版使用 A-I 架構。</li>
        <li>台北市把公共設施費用獨立為 B。</li>
        <li>台北市把相關申請建築容積獎勵所支付之費用獨立為 C。</li>
        <li>台北市容積移轉為 E，新北市容積移轉為 H。</li>
        <li>台北市管理費為 I，新北市管理費為 F。</li>
        <li>鑽探費：台北市 97,500 元 / 孔，新北市 75,000 元 / 孔。</li>
        <li>外接水電瓦斯：台北市 97,500 元 / 戶，新北市 75,000 元 / 戶。</li>
        <li>公共設施開闢：台北市道路 5,070 元 / ㎡、綠地 4,800 元 / ㎡、鄰里公園 6,000 元 / ㎡；新北市計畫道路不得超過 4,000 元 / ㎡，其他依管理機關審定。</li>
        <li>拆除費：台北市依構造與樓層分級，新北市依構造別固定單價。</li>
        <li>台北市資料僅供差異比較，泰山案預設以新北市為準。</li>
      </ul>
    </details>
  );
}

function CostAndCommonBurdenModule({
  currentCase,
  rosterStaging,
  baseInfo,
  capacityResult,
  floorResult,
  costInputs,
  costResults,
  saveStatus,
  onCostInputsChange,
  onCostResultsChange,
  onMarkUnsaved,
  onSaveModule,
  onGoToCases,
}) {
  const effectiveInputs = normalizeCostInputs(costInputs);
  const calculatedResults = useMemo(
    () => calculateCostResults(effectiveInputs, rosterStaging, baseInfo, capacityResult, floorResult),
    [effectiveInputs, rosterStaging, baseInfo, capacityResult, floorResult],
  );
  const resultSignature = JSON.stringify(calculatedResults);

  useEffect(() => {
    onCostResultsChange(calculatedResults);
  }, [resultSignature]);

  if (!currentCase) {
    return (
      <div className="eval-module-stack">
        <CostCaseRequiredNotice onGoToCases={onGoToCases} />
      </div>
    );
  }

  const rosterSummary = buildRosterBaseSummary(rosterStaging);
  const context = { rosterSummary, baseInfo, capacityResult, floorResult };
  const displayResults = calculatedResults;
  const summaryItems = [
    ["共同負擔總額", formatCurrencyTwd(displayResults.commonBurdenTotal)],
    ["非共同負擔成本小計", formatCurrencyTwd(displayResults.otherCostTotal)],
    ["公司內部總成本觀察", formatCurrencyTwd(displayResults.internalTotalCost)],
    ["新北市基準", "A + B + C + D + E + F + G + H"],
  ];
  const sourceItems = [
    ["目前案件", `${currentCase.code} / ${currentCase.name}`],
    ["土地面積", formatSqmAndPing(rosterSummary.landAreaSqm)],
    ["公告現值總額", formatCurrencyTwd(rosterSummary.assessedCurrentValueTotal)],
    ["總容積量", formatSqmAndPing(capacityResult?.totalCapacityAreaSqm)],
    ["容積移轉比例", formatPercentValue(capacityResult?.transferRatio)],
    ["容積移轉量", formatSqmAndPing(capacityResult?.transferAreaSqm)],
    ["TDR 評點狀態", capacityResult?.tdrScoringSummary?.scoringStatus || "待評點"],
  ];
  const groupSummaryItems = costCommonGroups.map((group) => [
    `${group.id} ${group.title}`,
    formatCurrencyTwd(displayResults.groupTotals?.[group.id]),
  ]);

  const handleCommonItemChange = (itemId) => (field) => (event) => {
    onMarkUnsaved();
    onCostInputsChange({
      ...effectiveInputs,
      commonItems: {
        ...effectiveInputs.commonItems,
        [itemId]: {
          ...effectiveInputs.commonItems[itemId],
          [field]: event.target.value,
        },
      },
    });
  };
  const handleCommonItemCheckboxChange = (itemId) => (field) => (event) => {
    onMarkUnsaved();
    onCostInputsChange({
      ...effectiveInputs,
      commonItems: {
        ...effectiveInputs.commonItems,
        [itemId]: {
          ...effectiveInputs.commonItems[itemId],
          [field]: event.target.checked,
        },
      },
    });
  };
  const handleOtherCostChange = (itemId, field) => (event) => {
    onMarkUnsaved();
    onCostInputsChange({
      ...effectiveInputs,
      otherCostItems: {
        ...effectiveInputs.otherCostItems,
        [itemId]: {
          ...effectiveInputs.otherCostItems[itemId],
          [field]: event.target.value,
        },
      },
    });
  };

  return (
    <div className="eval-module-stack">
      <CurrentCaseSummary currentCase={currentCase} />
      <ModuleSaveStatusBar saveStatus={saveStatus} onSave={onSaveModule} />

      <section className="eval-module-section eval-cost-hero">
        <div className="eval-section-head">
          <h4>成本與共同負擔總覽</h4>
          <p>本區依新北市共同負擔基準建立；實際認列仍以主管機關審查與核定內容為準。</p>
        </div>
        <DataSummaryGrid items={summaryItems} />
        <DataSummaryGrid items={sourceItems} />
      </section>

      <section className="eval-module-section">
        <div className="eval-section-head">
          <h4>共同負擔費用 A-H</h4>
          <p>共同負擔總額 = A + B + C + D + E + F + G + H。各項可展開輸入與檢視上限。</p>
        </div>
        <DataSummaryGrid items={groupSummaryItems} />
      </section>

      {costCommonGroups.map((group) => {
        const definitions = costCommonItemDefinitions.filter((item) => item.groupId === group.id);
        return (
          <details className="eval-module-section eval-collapsible-section eval-cost-group" key={group.id}>
            <summary>{group.id} {group.title}</summary>
            <p>{group.subtitle}</p>
            {group.id === "H" && (
              <div className="eval-cost-tdr-note">
                <DataSummaryGrid items={[
                  ["目標容移比例", formatPercentValue(capacityResult?.transferRatio)],
                  ["容積移轉量", formatSqmAndPing(capacityResult?.transferAreaSqm)],
                  ["捐贈公設地方式", "保留契約佐證欄位"],
                  ["折繳代金方式", "保留估價提列欄位"],
                ]} />
                <p>正式容積移轉費用仍待估價、契約及主管機關審查確認。</p>
              </div>
            )}
            <div className="eval-table-wrap eval-cost-table-wrap">
              <table className="eval-table eval-cost-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>提列公式</th>
                    <th>數量 / 單價</th>
                    <th>金額</th>
                    <th>新北市提列上限 / 認列基準</th>
                    <th>佐證文件</th>
                    <th>列入共同負擔</th>
                    <th>備註</th>
                  </tr>
                </thead>
                <tbody>
                  {definitions.map((definition) => (
                    <CostCommonItemRow
                      key={definition.id}
                      definition={definition}
                      input={effectiveInputs.commonItems[definition.id]}
                      result={displayResults.items?.[definition.id]}
                      context={context}
                      onChange={handleCommonItemChange(definition.id)}
                      onCheckboxChange={handleCommonItemCheckboxChange(definition.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {group.id === "C" && (
              <details className="eval-inline-details">
                <summary>地籍整理行政規費項目</summary>
                <ul>
                  <li>所有權移轉登記：申報地價 × 1‰</li>
                  <li>建物所有權第一次登記：使用執照所載造價 × 2‰</li>
                  <li>權利變換登記：申報地價 × 1‰</li>
                  <li>信託登記：信託契約所載土地及建物價值 × 1‰</li>
                  <li>塗銷信託登記：信託契約所載土地及建物價值 × 1‰</li>
                  <li>建物第一次測量：位置測量費 4,000 + 轉繪費 × 更新後建號數減一 × 200</li>
                  <li>建物滅失：更新前建號數 × 400</li>
                  <li>土地分割：分割地號數 × 800</li>
                </ul>
              </details>
            )}
          </details>
        );
      })}

      <section className="eval-module-section eval-cost-other">
        <div className="eval-section-head">
          <h4>其他成本 / 非共同負擔</h4>
          <p>此區為公司內部投資與承接評估使用，不代表可列入權利變換共同負擔。</p>
        </div>
        <div className="eval-table-wrap eval-cost-table-wrap">
          <table className="eval-table eval-cost-table eval-cost-table--other">
            <thead>
              <tr>
                <th>項目</th>
                <th>金額</th>
                <th>狀態</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              {otherCostItemDefinitions.map((definition) => {
                const input = effectiveInputs.otherCostItems[definition.id];
                const result = displayResults.otherItems?.[definition.id];
                return (
                  <tr key={definition.id}>
                    <td><strong>{definition.title}</strong></td>
                    <td>
                      <CostTextInput label={`${definition.title} 金額`} value={input.amount} onChange={handleOtherCostChange(definition.id, "amount")} />
                    </td>
                    <td>{result?.status || "待填"}</td>
                    <td>
                      <CostTextInput label={`${definition.title} 備註`} value={input.note} onChange={handleOtherCostChange(definition.id, "note")} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <TaipeiDifferenceReference />
    </div>
  );
}

const downstreamModuleGuidance = {
  costs: {
    title: "成本與共同負擔",
    description: "本模組將承接基地、容積、坪效與評點結果，作為後續成本與分配試算基礎。",
    missing: "下一階段建立成本項目、共同負擔與版本紀錄。",
  },
  sales: {
    title: "銷售價格情境",
    description: "本模組將承接可售面積與成本結果，建立低 / 中 / 高銷售單價情境。",
    missing: "下一階段建立行情輸入、總銷與損益平衡判斷。",
  },
  allocation: {
    title: "實施方式與權利分配",
    description: "本模組將承接權利人清冊、坪效、成本、銷售與開發路徑，進行分配條件判斷。",
    missing: "下一階段建立分配模式、共同負擔與地主 / 實施者分回摘要。",
  },
  cashflow: {
    title: "現金流與資金需求",
    description: "本模組將承接成本、銷售回收與開發期程，整理資金需求與高峰缺口。",
    missing: "下一階段建立分期支出、回收節點與融資假設。",
  },
  "bank-report": {
    title: "銀行融資報告",
    description: "本模組將彙整案件、清冊、基地、容積、坪效、成本、銷售、分配與金流結果。",
    missing: "下一階段建立報告章節、風險摘要與送件資料包。",
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
      <p className="eval-stage-note">{guidance.missing}</p>
    </section>
  );
}

function RolePermissionPanel({ profile }) {
  return (
    <section className="eval-module-section eval-role-rules">
      <div className="eval-section-head">
        <h4>角色權限顯示規則</h4>
        <p>
          目前以前端角色切換示範 admin / user 的顯示差異。正式上線時，後端 API 與資料庫規則仍必須檢查角色、授權方案與設備綁定，不可只靠前端隱藏。
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
          <strong>目前角色</strong>
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
        <p>案件個別參數與全系統預設參數要分開控管；這裡以角色切換呈現後續正式權限規則。</p>
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

function OwnershipModule({ module, currentCase, rosterStaging, onRosterStagingChange, onMarkUnsaved, onGoToCases }) {
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
        preview={rosterStaging}
        onPreviewChange={onRosterStagingChange}
      />
      <RosterMaintenancePanel
        currentCase={currentCase}
        rosterStaging={rosterStaging}
        onRosterStagingChange={onRosterStagingChange}
        onMarkUnsaved={onMarkUnsaved}
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
  currentCostInputs,
  currentCostResults,
  moduleSaveStatusByCaseId,
  rosterStagingByCaseId,
  baseInfoByCaseId,
  capacityInputsByCaseId,
  capacityResultsByCaseId,
  floorEfficiencyParamsByCaseId,
  floorEfficiencyResultsByCaseId,
  costInputsByCaseId,
  costResultsByCaseId,
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
  onCostInputsChange,
  onCostResultsChange,
  onMarkModuleUnsaved,
  onSaveModuleData,
  onClearLocalTestData,
  onImportLocalTestData,
  onLoadDatabaseCases,
  onGoToCases,
}) {
  if (module.type === "paths") {
    return <DevelopmentPathModule />;
  }

  if (module.type === "takeover") {
    return (
      <TakeoverEvaluationModule
        currentCase={currentCase}
        currentCapacityResults={currentCapacityResults}
        currentFloorEfficiencyResults={currentFloorEfficiencyResults}
      />
    );
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
        costInputsByCaseId={costInputsByCaseId}
        costResultsByCaseId={costResultsByCaseId}
        onAddCase={onAddCase}
        onUpdateCase={onUpdateCase}
        onDeleteCase={onDeleteCase}
        onSelectCase={onSelectCase}
        onClearLocalTestData={onClearLocalTestData}
        onImportLocalTestData={onImportLocalTestData}
        onLoadDatabaseCases={onLoadDatabaseCases}
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
        onMarkUnsaved={() => onMarkModuleUnsaved(module.id)}
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

  if (module.id === "costs") {
    return (
      <CostAndCommonBurdenModule
        currentCase={currentCase}
        rosterStaging={currentRosterStaging}
        baseInfo={currentBaseInfo}
        capacityResult={currentCapacityResults}
        floorResult={currentFloorEfficiencyResults}
        costInputs={currentCostInputs}
        costResults={currentCostResults}
        saveStatus={getCurrentSaveStatus(moduleSaveStatusByCaseId, currentCase?.id, module.id)}
        onCostInputsChange={onCostInputsChange}
        onCostResultsChange={onCostResultsChange}
        onMarkUnsaved={() => onMarkModuleUnsaved(module.id)}
        onSaveModule={() => onSaveModuleData(module.id)}
        onGoToCases={onGoToCases}
      />
    );
  }

  if (DOWNSTREAM_PLACEHOLDER_MODULE_IDS.has(module.id)) {
    return (
      <div className="eval-module-stack">
        <DownstreamModuleNotice moduleId={module.id} currentCase={currentCase} capacityResult={currentCapacityResults} floorResult={currentFloorEfficiencyResults} />
      </div>
    );
  }

  return (
    <div className="eval-module-stack">
      {module.id === "parameters" && <ParameterAccessNotice profile={accessProfile} />}
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
          <p>目前尚未串接正式帳號後端。第一階段先使用前端登入狀態，讓系統主畫面、模組導覽與欄位骨架可以先被檢視。</p>
          <button type="button" onClick={onLogin}>
            使用測試身分登入
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
          <p>依目前角色與授權方案顯示。</p>
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
            本系統目前為三策內部授權測試，未開放公開使用。
          </p>
        </div>

        <aside className="eval-login-card" aria-label="三策管理者測試登入">
          <LockKeyhole aria-hidden="true" size={34} />
          <h2>管理者測試登入</h2>
          <form className="eval-auth-form" onSubmit={handleSubmit}>
            <label>
              <span>EMAIL</span>
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
              <span>PASSWORD</span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="請輸入密碼"
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

function isLocalSystemTestHost() {
  if (typeof window === "undefined") {
    return false;
  }
  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);
}

async function fetchSystemAuthJson(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SYSTEM_AUTH_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const isJsonResponse = contentType.toLowerCase().includes("application/json");
    const data = isJsonResponse ? await response.json().catch(() => ({})) : {};
    return { response, data, isJsonResponse };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getSystemLoginErrorMessage(response, isJsonResponse, error) {
  if (error?.name === "AbortError") {
    return isLocalSystemTestHost()
      ? LOCAL_SYSTEM_AUTH_UNAVAILABLE_MESSAGE
      : "登入服務逾時，請稍後再試。";
  }

  if (isLocalSystemTestHost() && (response?.status === 404 || !isJsonResponse)) {
    return LOCAL_SYSTEM_AUTH_UNAVAILABLE_MESSAGE;
  }

  if (response?.status === 404 || !isJsonResponse) {
    return "登入服務暫時無法使用。請稍後再試。";
  }

  if (response?.status === 503) {
    return "登入服務尚未完成環境設定。請確認測試站設定，或改用正式測試站登入。";
  }

  if (response?.status >= 500) {
    return "登入服務暫時無法使用。請稍後再試，或改用正式測試站登入。";
  }

  return SYSTEM_AUTH_FAILED_MESSAGE;
}

export function EvaluationSystem({ routeHash = window.location.hash }) {
  const [authState, setAuthState] = useState({ status: "checking", email: "", role: "" });
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthServiceUnavailable, setIsAuthServiceUnavailable] = useState(false);
  const [mockRole, setMockRole] = useState("admin");
  const [activeModuleId, setActiveModuleId] = useState(evaluationModules[0].id);
  const [cases, setCases] = useState(loadStoredCases);
  const [currentCaseId, setCurrentCaseId] = useState(loadStoredCurrentCaseId);
  const [rosterStagingByCaseId, setRosterStagingByCaseId] = useState(() => normalizeRosterStagingByCaseId(loadStoredRecord(ROSTER_STAGING_STORAGE_KEY)));
  const [baseInfoByCaseId, setBaseInfoByCaseId] = useState(() => loadStoredRecord(BASE_INFO_STORAGE_KEY));
  const [capacityInputsByCaseId, setCapacityInputsByCaseId] = useState(() => loadStoredRecord(CAPACITY_INPUTS_STORAGE_KEY));
  const [capacityResultsByCaseId, setCapacityResultsByCaseId] = useState(() => loadStoredRecord(CAPACITY_RESULTS_STORAGE_KEY));
  const [floorEfficiencyParamsByCaseId, setFloorEfficiencyParamsByCaseId] = useState(() => loadStoredRecord(FLOOR_EFFICIENCY_PARAMS_STORAGE_KEY));
  const [floorEfficiencyResultsByCaseId, setFloorEfficiencyResultsByCaseId] = useState(() => loadStoredRecord(FLOOR_EFFICIENCY_RESULTS_STORAGE_KEY));
  const [costInputsByCaseId, setCostInputsByCaseId] = useState(() => loadStoredRecord(COST_INPUTS_STORAGE_KEY));
  const [costResultsByCaseId, setCostResultsByCaseId] = useState(() => loadStoredRecord(COST_RESULTS_STORAGE_KEY));
  const [moduleSaveStatusByCaseId, setModuleSaveStatusByCaseId] = useState({});
  const isLoggedIn = authState.status === "authenticated";
  const isTestRoute = routeHash === SYSTEM_TEST_HASH;
  const accessProfile = mockAccessProfiles[mockRole];
  const currentCase = useMemo(
    () => cases.find((item) => item.id === currentCaseId) ?? null,
    [cases, currentCaseId],
  );
  const currentRosterStaging = currentCase ? normalizeRosterStaging(rosterStagingByCaseId[currentCase.id]) ?? null : null;
  const currentBaseInfo = currentCase ? baseInfoByCaseId[currentCase.id] ?? defaultBaseInfo : defaultBaseInfo;
  const currentCapacityInputs = currentCase ? capacityInputsByCaseId[currentCase.id] ?? defaultCapacityInputs : defaultCapacityInputs;
  const currentCapacityResults = currentCase ? capacityResultsByCaseId[currentCase.id] ?? null : null;
  const currentFloorEfficiencyParams = currentCase ? floorEfficiencyParamsByCaseId[currentCase.id] ?? defaultFloorEfficiencyParams : defaultFloorEfficiencyParams;
  const currentFloorEfficiencyResults = currentCase ? floorEfficiencyResultsByCaseId[currentCase.id] ?? null : null;
  const currentCostInputs = currentCase ? costInputsByCaseId[currentCase.id] ?? defaultCostInputs : defaultCostInputs;
  const currentCostResults = currentCase ? costResultsByCaseId[currentCase.id] ?? null : null;
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
    writeStoredJson(COST_INPUTS_STORAGE_KEY, costInputsByCaseId);
  }, [costInputsByCaseId]);

  useEffect(() => {
    writeStoredJson(COST_RESULTS_STORAGE_KEY, costResultsByCaseId);
  }, [costResultsByCaseId]);

  useEffect(() => {
    const {
      costInputsByCaseId: completeCostInputs,
      costResultsByCaseId: completeCostResults,
    } = buildCompleteCostRecordsByCaseId({
      cases,
      costInputsByCaseId,
      costResultsByCaseId,
      rosterStagingByCaseId,
      baseInfoByCaseId,
      capacityResultsByCaseId,
      floorEfficiencyResultsByCaseId,
    });

    if (!recordsHaveSameData(costInputsByCaseId, completeCostInputs)) {
      setCostInputsByCaseId(completeCostInputs);
    }
    if (!recordsHaveSameData(costResultsByCaseId, completeCostResults)) {
      setCostResultsByCaseId(completeCostResults);
    }
  }, [
    cases,
    costInputsByCaseId,
    costResultsByCaseId,
    rosterStagingByCaseId,
    baseInfoByCaseId,
    capacityResultsByCaseId,
    floorEfficiencyResultsByCaseId,
  ]);

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

    fetchSystemAuthJson("/api/sanze-system-session", { credentials: "include" })
      .then(({ response, data, isJsonResponse }) => {
        if (!isMounted) {
          return;
        }

        setIsAuthServiceUnavailable(isLocalSystemTestHost() && (response.status === 404 || !isJsonResponse));

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
    setLoginError("");

    if (isLocalSystemTestHost() && isAuthServiceUnavailable) {
      setLoginError(LOCAL_SYSTEM_AUTH_UNAVAILABLE_MESSAGE);
      setAuthState({ status: "unauthenticated", email: "", role: "" });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const { response, data, isJsonResponse } = await fetchSystemAuthJson("/api/sanze-system-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok || !data.authenticated) {
        setLoginError(getSystemLoginErrorMessage(response, isJsonResponse));
        setAuthState({ status: "unauthenticated", email: "", role: "" });
        return;
      }

      setAuthState({ status: "authenticated", email: data.email ?? email, role: data.role ?? "admin" });
      setMockRole("admin");
    } catch (error) {
      setLoginError(getSystemLoginErrorMessage(null, true, error));
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
    setCurrentCaseId(createdCase.id);
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
    setCostInputsByCaseId((current) => {
      const next = { ...current };
      delete next[caseId];
      return next;
    });
    setCostResultsByCaseId((current) => {
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
        next[currentCase.id] = normalizeRosterStaging(preview);
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

  const handleCostInputsChange = (nextCostInputs) => {
    if (!currentCase) {
      return;
    }

    setCostInputsByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextCostInputs,
    }));
  };

  const handleCostResultsChange = (nextCostResults) => {
    if (!currentCase) {
      return;
    }

    setCostResultsByCaseId((current) => ({
      ...current,
      [currentCase.id]: nextCostResults,
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
    setCostInputsByCaseId({});
    setCostResultsByCaseId({});
    setModuleSaveStatusByCaseId({});
  };

  const handleImportLocalTestData = (importedData) => {
    const importedCases = Array.isArray(importedData?.cases) ? importedData.cases : [];
    const importedRosterStaging = normalizeRosterStagingByCaseId(importedData?.rosterStagingByCaseId);
    const importedBaseInfo = isPlainRecord(importedData?.baseInfoByCaseId)
      ? importedData.baseInfoByCaseId
      : {};
    const importedCapacityInputs = isPlainRecord(importedData?.capacityInputsByCaseId)
      ? importedData.capacityInputsByCaseId
      : {};
    const importedFloorEfficiencyParams = isPlainRecord(importedData?.floorEfficiencyParamsByCaseId)
      ? importedData.floorEfficiencyParamsByCaseId
      : {};
    const importedCostInputs = isPlainRecord(importedData?.costInputsByCaseId)
      ? importedData.costInputsByCaseId
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
    const {
      costInputsByCaseId: completeCostInputs,
      costResultsByCaseId: recalculatedCostResults,
    } = buildCompleteCostRecordsByCaseId({
      cases: importedCases,
      costInputsByCaseId: importedCostInputs,
      costResultsByCaseId: importedData?.costResultsByCaseId,
      rosterStagingByCaseId: importedRosterStaging,
      baseInfoByCaseId: importedBaseInfo,
      capacityResultsByCaseId: recalculatedCapacityResults,
      floorEfficiencyResultsByCaseId: recalculatedFloorEfficiencyResults,
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
    writeStoredJson(COST_INPUTS_STORAGE_KEY, completeCostInputs);
    writeStoredJson(COST_RESULTS_STORAGE_KEY, recalculatedCostResults);
    LOCAL_TEST_DATA_RECORD_FIELDS
      .filter(({ dataKey }) => ![
        "capacityInputsByCaseId",
        "capacityResultsByCaseId",
        "floorEfficiencyParamsByCaseId",
        "floorEfficiencyResultsByCaseId",
        "costInputsByCaseId",
        "costResultsByCaseId",
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
    setCostInputsByCaseId(completeCostInputs);
    setCostResultsByCaseId(recalculatedCostResults);
    setModuleSaveStatusByCaseId({});
  };

  const handleLoadDatabaseCases = (payload, mode = "merge") => {
    const loaded = normalizeDatabaseLoadPayload(payload);

    if (!loaded.cases.length) {
      return { caseCount: 0 };
    }

    if (mode === "replace") {
      const nextCurrentCaseId = loaded.cases.some((caseItem) => caseItem.id === currentCaseId)
        ? currentCaseId
        : loaded.cases[0]?.id || "";

      LOCAL_TEST_DATA_RECORD_FIELDS
        .filter(({ dataKey }) => !DATABASE_SYNCED_RECORD_KEYS.has(dataKey))
        .forEach(({ storageKey }) => removeStoredJson(storageKey));
      setCases(loaded.cases);
      setRosterStagingByCaseId(loaded.rosterStagingByCaseId);
      setBaseInfoByCaseId(loaded.baseInfoByCaseId);
      setCapacityInputsByCaseId(loaded.capacityInputsByCaseId);
      setCapacityResultsByCaseId(loaded.capacityResultsByCaseId);
      setFloorEfficiencyParamsByCaseId(loaded.floorEfficiencyParamsByCaseId);
      setFloorEfficiencyResultsByCaseId(loaded.floorEfficiencyResultsByCaseId);
      setCostInputsByCaseId(loaded.costInputsByCaseId);
      setCostResultsByCaseId(loaded.costResultsByCaseId);
      setCurrentCaseId(nextCurrentCaseId);
      setModuleSaveStatusByCaseId({});
      return { caseCount: loaded.cases.length };
    }

    setCases((currentCases) => {
      const mergedCases = [...currentCases];

      loaded.cases.forEach((loadedCase) => {
        const existingIndex = mergedCases.findIndex((item) => (
          item.id === loadedCase.id || (item.code && loadedCase.code && item.code === loadedCase.code)
        ));

        if (existingIndex >= 0) {
          mergedCases[existingIndex] = {
            ...mergedCases[existingIndex],
            ...loadedCase,
          };
          return;
        }

        mergedCases.push(loadedCase);
      });

      return mergedCases;
    });
    setRosterStagingByCaseId((current) => ({ ...current, ...loaded.rosterStagingByCaseId }));
    setBaseInfoByCaseId((current) => ({ ...current, ...loaded.baseInfoByCaseId }));
    setCapacityInputsByCaseId((current) => ({ ...current, ...loaded.capacityInputsByCaseId }));
    setCapacityResultsByCaseId((current) => ({ ...current, ...loaded.capacityResultsByCaseId }));
    setFloorEfficiencyParamsByCaseId((current) => ({ ...current, ...loaded.floorEfficiencyParamsByCaseId }));
    setFloorEfficiencyResultsByCaseId((current) => ({ ...current, ...loaded.floorEfficiencyResultsByCaseId }));
    setCostInputsByCaseId((current) => ({ ...current, ...loaded.costInputsByCaseId }));
    setCostResultsByCaseId((current) => ({ ...current, ...loaded.costResultsByCaseId }));
    setCurrentCaseId((current) => current || loaded.cases[0]?.id || "");
    return { caseCount: loaded.cases.length };
  };

  const handleGoToCases = () => {
    setActiveModuleId("case-management");
  };

  if (!isTestRoute) {
    return <EvaluationAccessClosed isChecking={authState.status === "checking"} />;
  }

  if (!isLoggedIn) {
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
            <div className="eval-role-switch" aria-label="角色切換">
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
            currentCostInputs={currentCostInputs}
            currentCostResults={currentCostResults}
            rosterStagingByCaseId={rosterStagingByCaseId}
            baseInfoByCaseId={baseInfoByCaseId}
            capacityInputsByCaseId={capacityInputsByCaseId}
            capacityResultsByCaseId={capacityResultsByCaseId}
            floorEfficiencyParamsByCaseId={floorEfficiencyParamsByCaseId}
            floorEfficiencyResultsByCaseId={floorEfficiencyResultsByCaseId}
            costInputsByCaseId={costInputsByCaseId}
            costResultsByCaseId={costResultsByCaseId}
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
            onCostInputsChange={handleCostInputsChange}
            onCostResultsChange={handleCostResultsChange}
            onMarkModuleUnsaved={handleMarkModuleUnsaved}
            onSaveModuleData={handleSaveModuleData}
            onClearLocalTestData={handleClearLocalTestData}
            onImportLocalTestData={handleImportLocalTestData}
            onLoadDatabaseCases={handleLoadDatabaseCases}
            onGoToCases={handleGoToCases}
          />
        </section>
      </section>
    </main>
  );
}
