// GENERATED from spec/modules/<m>/workflows.json guards[] + spec/guards/guard_checks.json by _validation/gen_guards.py — DO NOT EDIT.
// Preconditions run BEFORE a transition applies and BLOCK it (fail-closed) if unmet.
export class PreconditionError extends Error {}

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

async function precond_student_roster_ops_lock(supabase: Db, recordId: string): Promise<void> {
  const { data: src } = await supabase.from("student_roster_batches").select("*").eq("id", recordId).maybeSingle();
  if (!src) return;
  const row = src as Record<string, unknown>;
  const lid0 = row["school_id"] as string | undefined;
  if (!lid0) throw new PreconditionError("Cannot verify schools status (no school_id); transition blocked.");
  const { data: chk0, error: err0 } = await supabase.from("schools").select("status").eq("id", lid0).maybeSingle();
  if (err0 || !chk0) throw new PreconditionError("Could not verify schools status; transition blocked.");
  if ((chk0 as Record<string, unknown>)["status"] !== "active") throw new PreconditionError("School must be active to proceed.");
}

export const PRECONDITIONS: Record<string, (supabase: Db, recordId: string) => Promise<void>> = {
  "student_roster_ops:lock": precond_student_roster_ops_lock,
};

export async function runPreconditions(moduleId: string, action: string, supabase: Db, recordId: string): Promise<void> {
  const fn = PRECONDITIONS[`${moduleId}:${action}`];
  if (fn) await fn(supabase, recordId);
}
