// Generic domain-effect registry (FRAMEWORK). Typed domain effects (crypto/join/projection/ranking)
// that run AFTER a kernel transition applies (P3.10) but don't fit the declarative chains.json DSL.
// Aggregates each domain's effect map; the kernel calls runDomainEffect after runTransitionEffect.
import { DOMAIN_EFFECTS as CERT_EFFECTS } from "@/server/certificates/certEffects";
import { RESULT_DOMAIN_EFFECTS } from "@/server/results/resultEffects";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

const ALL: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  ...CERT_EFFECTS,
  ...RESULT_DOMAIN_EFFECTS,
};

export async function runDomainEffect(moduleId: string, action: string, supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const fn = ALL[`${moduleId}:${action}`];
  if (!fn) return;
  try {
    await fn(supabase, recordId, actor);
  } catch {
    /* best-effort: the transition already applied */
  }
}
