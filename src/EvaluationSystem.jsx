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
const ROSTER_STAGING_STORAGE_KEY = "sanze-evaluation-roster-staging-v1";
const BASE_INFO_STORAGE_KEY = "sanze-evaluation-base-info-v1";
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
  [CASES_STORAGE_KEY, ROSTER_STAGING_STORAGE_KEY, BASE_INFO_STORAGE_KEY].forEach(removeStoredJson);
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
            ? "此操作會清除本機瀏覽器中的案件、清冊暫存與基地資料，無法復原。確認清除？"
            : "目前系統仍為前端測試階段，案件、清冊暫存與基地資料會先存在本機瀏覽器。若看到舊版測試案件或需要重新測試，可清除本機測試資料。"}
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

function CaseManagementModule({
  accessProfile,
  cases,
  currentCase,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onSelectCase,
  onClearLocalTestData,
}) {
  const [caseForm, setCaseForm] = useState(defaultCaseForm);
  const [editingCaseId, setEditingCaseId] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [clearConfirmation, setClearConfirmation] = useState(null);
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
  };

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
            目前系統仍為前端測試階段，案件、清冊暫存與基地資料會先存在本機瀏覽器。若看到舊版測試案件或需要重新測試，可清除本機測試資料。
          </p>
        </div>
        <div className="eval-local-test-tools__body">
          <div>
            <strong>清除範圍</strong>
            <p>僅限三策開發評估系統 localStorage：案件、清冊暫存、基地基本資料；不會清除其他網站資料。</p>
          </div>
          <button type="button" className="eval-danger-action" onClick={handleRequestClearLocalData}>
            清除本機測試資料
          </button>
        </div>
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
    const ownerName = getFirstMatchingValue(row, ["地主姓名", "所有權人", "姓名", "名稱"]);
    const landNumber = getFirstMatchingValue(row, ["地號"]);

    return {
      sourceRowNumber: row.__rowNumber,
      ownerReferenceId: getFirstMatchingValue(row, ["地主編號", "權利人編號", "所有權人編號", "參考編號"]),
      ownerName,
      maskedIdentityCode: getFirstMatchingValue(row, ["身分證", "統編", "統一編號", "證號", "識別碼", "前碼"]),
      address: getFirstMatchingValue(row, ["地址", "通訊地址", "戶籍地址", "住址"]),
      landNumber,
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

  return mappedRows
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
      buildingArea: getFirstMatchingValue(row, ["建物面積", "面積"]),
      shareText: getFirstMatchingValue(row, ["權利範圍", "持分"]),
      note: getFirstMatchingValue(row, ["備註", "說明"]),
      validationStatus: ownerName && buildingNumber ? "可建立疑似群組" : "待人工確認",
    };
  });

  return mappedRows
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

function buildRosterPreview(file, workbookData) {
  const landRights = buildLandRightRows(workbookData.landRows);
  const buildingRights = buildBuildingRightRows(workbookData.buildingRows);
  const { partyRows, issues } = buildPartyPreview(landRights, buildingRights);
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
  const normalizedValue = normalizeCellValue(value).replace(/,/g, "");
  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function formatAreaSummary(value) {
  return `${value.toLocaleString("zh-TW", { maximumFractionDigits: 2 })} 平方公尺`;
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
  const areaValues = uniqueLandRows.map((row) => parseRosterNumber(row.landArea));
  const canSumArea = areaValues.length > 0 && areaValues.every((value) => Number.isFinite(value));
  const areaTotal = canSumArea ? areaValues.reduce((total, value) => total + value, 0) : null;
  const announcedCurrentValueCount = uniqueLandRows.filter((row) => normalizeCellValue(row.announcedCurrentValue)).length;
  const announcedLandValueCount = uniqueLandRows.filter((row) => normalizeCellValue(row.announcedLandValue)).length;

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
    landAreaSummary: areaTotal === null ? "待清冊補齊" : formatAreaSummary(areaTotal),
    announcedCurrentValueStatus: announcedCurrentValueCount
      ? `清冊已提供 ${announcedCurrentValueCount} 筆地號資料`
      : "清冊未提供",
    announcedLandValueStatus: announcedLandValueCount
      ? `清冊已提供 ${announcedLandValueCount} 筆地號資料`
      : "清冊未提供",
  };
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
        土地面積以唯一地號為基準彙整；同一地號若出現在多筆權利列，只計算一次，避免持分列重複加總。
      </p>
    </section>
  );
}

function BaseInfoModule({ currentCase, baseInfo, rosterStaging, onBaseInfoChange, onGoToCases }) {
  if (!currentCase) {
    return (
      <div className="eval-module-stack">
        <BaseInfoCaseRequiredNotice onGoToCases={onGoToCases} />
      </div>
    );
  }

  const handleBaseInfoChange = (field) => (event) => {
    onBaseInfoChange({
      ...baseInfo,
      [field]: event.target.value,
    });
  };

  return (
    <div className="eval-module-stack">
      <CurrentCaseSummary currentCase={currentCase} />
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
  currentCase,
  currentBaseInfo,
  currentRosterStaging,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onSelectCase,
  onBaseInfoChange,
  onRosterStagingChange,
  onClearLocalTestData,
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
        currentCase={currentCase}
        onAddCase={onAddCase}
        onUpdateCase={onUpdateCase}
        onDeleteCase={onDeleteCase}
        onSelectCase={onSelectCase}
        onClearLocalTestData={onClearLocalTestData}
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
        onBaseInfoChange={onBaseInfoChange}
        onGoToCases={onGoToCases}
      />
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
  const [currentCaseId, setCurrentCaseId] = useState("");
  const [rosterStagingByCaseId, setRosterStagingByCaseId] = useState(() => loadStoredRecord(ROSTER_STAGING_STORAGE_KEY));
  const [baseInfoByCaseId, setBaseInfoByCaseId] = useState(() => loadStoredRecord(BASE_INFO_STORAGE_KEY));
  const isLoggedIn = authState.status === "authenticated";
  const isTestRoute = routeHash === SYSTEM_TEST_HASH;
  const accessProfile = mockAccessProfiles[mockRole];
  const currentCase = useMemo(
    () => cases.find((item) => item.id === currentCaseId) ?? null,
    [cases, currentCaseId],
  );
  const currentRosterStaging = currentCase ? rosterStagingByCaseId[currentCase.id] ?? null : null;
  const currentBaseInfo = currentCase ? baseInfoByCaseId[currentCase.id] ?? defaultBaseInfo : defaultBaseInfo;
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
    if (currentCaseId && !cases.some((item) => item.id === currentCaseId)) {
      setCurrentCaseId("");
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
    if (currentCaseId === caseId) {
      setCurrentCaseId("");
    }
  };

  const handleSelectCase = (caseId) => {
    setCurrentCaseId(caseId);
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

  const handleClearLocalTestData = () => {
    clearStoredEvaluationData();
    setCases([]);
    setCurrentCaseId("");
    setRosterStagingByCaseId({});
    setBaseInfoByCaseId({});
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
            currentCase={currentCase}
            currentBaseInfo={currentBaseInfo}
            currentRosterStaging={currentRosterStaging}
            onAddCase={handleAddCase}
            onUpdateCase={handleUpdateCase}
            onDeleteCase={handleDeleteCase}
            onSelectCase={handleSelectCase}
            onBaseInfoChange={handleBaseInfoChange}
            onRosterStagingChange={handleRosterStagingChange}
            onClearLocalTestData={handleClearLocalTestData}
            onGoToCases={handleGoToCases}
          />
        </section>
      </section>
    </main>
  );
}
