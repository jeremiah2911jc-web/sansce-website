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

export async function checkSupabaseConnection() {
  if (!supabaseConfig.isConfigured) {
    return {
      status: "not-configured",
      label: "未設定",
      detail: "資料庫尚未設定，仍使用本機測試資料。",
    };
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      return {
        status: "error",
        label: "連線錯誤",
        detail: "目前仍使用本機測試資料。",
      };
    }

    return {
      status: "connected",
      label: "可連線",
      detail: "目前仍使用本機測試資料。",
    };
  } catch {
    return {
      status: "error",
      label: "連線錯誤",
      detail: "目前仍使用本機測試資料。",
    };
  }
}
