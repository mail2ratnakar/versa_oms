import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Feature flags. Conservative by default (off unless explicitly enabled).
 * Resolution: env (FEATURE_<KEY>_ENABLED=true) with optional DB override
 * (feature_flags table). Risky exposure stays gated.
 */
const PREFIX = "FEATURE_";

export function isFeatureEnabledSync(key: string): boolean {
  return process.env[`${PREFIX}${key.toUpperCase()}_ENABLED`] === "true";
}

export async function isFeatureEnabled(key: string): Promise<boolean> {
  let enabled = isFeatureEnabledSync(key);
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("feature_flags").select("enabled").eq("key", key).maybeSingle();
    if (data) enabled = Boolean(data.enabled);
  } catch {
    // no DB: fall back to env value
  }
  return enabled;
}
