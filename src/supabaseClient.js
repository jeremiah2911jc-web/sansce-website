import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabaseConfig = {
  url: supabaseUrl,
  hasAnonKey: Boolean(supabaseAnonKey),
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};

export const supabase = supabaseConfig.isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

function buildStatus(status, label, detail, description = "") {
  return {
    status,
    label,
    detail,
    description,
  };
}

function isProtectedTableAccessError(error) {
  if (!error) {
    return false;
  }

  const status = String(error.status ?? "");
  const errorText = [
    error.code,
    error.message,
    error.details,
    error.hint,
    status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return [
    "permission denied",
    "rls",
    "row-level security",
    "401",
    "403",
    "insufficient_privilege",
    "pgrst",
  ].some((marker) => errorText.includes(marker));
}

async function checkSupabaseApiReachability() {
  const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/settings`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  return response.ok;
}

export async function checkSupabaseConnection() {
  if (!supabaseConfig.isConfigured) {
    return buildStatus("not-configured", "未設定", "資料庫尚未設定，仍使用本機測試資料。");
  }

  try {
    // URL parsing catches obvious configuration mistakes before any network request.
    new URL(supabaseUrl);
  } catch {
    return buildStatus(
      "error",
      "連線錯誤",
      "目前仍使用本機測試資料。請檢查 Vercel env 或 Supabase project 狀態。",
    );
  }

  try {
    const apiReachable = await checkSupabaseApiReachability();
    if (!apiReachable || !supabase) {
      return buildStatus(
        "error",
        "連線錯誤",
        "目前仍使用本機測試資料。請檢查 Vercel env 或 Supabase project 狀態。",
      );
    }

    const { error } = await supabase
      .from("sanze_cases")
      .select("id")
      .limit(1);

    if (isProtectedTableAccessError(error)) {
      return buildStatus(
        "rls-protected",
        "API 可達，資料表受 RLS 保護",
        "目前仍使用本機測試資料。",
        "第一階段僅檢查 Supabase Vite env 與 API 可達性，尚未啟用案件資料同步；正式同步需完成 Auth / RLS policy / user-case mapping。",
      );
    }

    if (error) {
      return buildStatus(
        "error",
        "連線錯誤",
        "目前仍使用本機測試資料。請檢查 Vercel env 或 Supabase project 狀態。",
      );
    }

    return buildStatus(
      "connected",
      "可連線",
      "資料庫可連線；目前仍採 localStorage + DB 並行模式。",
    );
  } catch {
    return buildStatus(
      "error",
      "連線錯誤",
      "目前仍使用本機測試資料。請檢查 Vercel env 或 Supabase project 狀態。",
    );
  }
}
