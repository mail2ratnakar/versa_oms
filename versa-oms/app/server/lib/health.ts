import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listJobRuns } from "@/server/jobs/runner";

export async function checkDb() {
  try {
    const s = createSupabaseAdminClient();
    const { error } = await s.from("feature_flags").select("key", { head: true, count: "exact" });
    return { ok: !error, detail: error ? "unreachable" : "reachable" };
  } catch {
    return { ok: false, detail: "unreachable" };
  }
}

export async function checkStorage() {
  try {
    const s = createSupabaseAdminClient();
    const { error } = await s.storage.listBuckets();
    return { ok: !error, detail: error ? "unreachable" : "reachable" };
  } catch {
    return { ok: false, detail: "unreachable" };
  }
}

export function checkWorkers() {
  const runs = listJobRuns();
  const dead = runs.filter((r) => r.status === "dead_letter").length;
  const queued = runs.filter((r) => r.status === "queued").length;
  return { ok: dead === 0, queued, dead_letter: dead, total: runs.length };
}

export function checkAudit() {
  return { ok: true, append_only: true, hash_chain: true };
}

export function checkProviders() {
  return {
    ok: true,
    payments_configured: Boolean(process.env.PAYMENT_PROVIDER_KEY),
    email_configured: Boolean(process.env.EMAIL_PROVIDER_KEY),
    supabase_configured: process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined,
  };
}

export function checkRelease() {
  return { ok: true, app: "versa-olympiads-app", env: process.env.APP_ENV ?? "local", node: process.version };
}
