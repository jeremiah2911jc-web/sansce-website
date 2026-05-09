import { createClient } from "@supabase/supabase-js";

export const DATABASE_SYNC_NOT_CONFIGURED_MESSAGE = "資料庫後端同步尚未設定。";

export function getSupabaseAdminConfig() {
  return {
    url: process.env.SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };
}

export function isSupabaseAdminConfigured(config = getSupabaseAdminConfig()) {
  return Boolean(config.url && config.serviceRoleKey);
}

export function createSupabaseAdminClient(config = getSupabaseAdminConfig()) {
  if (!isSupabaseAdminConfigured(config)) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
