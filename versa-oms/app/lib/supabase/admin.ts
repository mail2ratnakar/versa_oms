import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role Supabase client (BYPASSES RLS). Server-only. Use exclusively for
 * trusted operations after server-side authorization has been enforced by guards:
 * append-only audit writes, idempotency bookkeeping, system jobs. Never expose to
 * the browser and never call before a guard has authorized the actor.
 */
export function createSupabaseAdminClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
