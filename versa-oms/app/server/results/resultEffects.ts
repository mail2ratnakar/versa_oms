// Result domain effects (FRAMEWORK — FR-RESULTS-RANKING-0006). Wires the dead ranking helper:
// on results_ops:generate, rank the batch's candidate_results server-side (competition ranking),
// snapshot certificate eligibility, and mark them ranked. Ranks/eligibility are NEVER client input.
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { rankCandidates, type Scored } from "@/server/eval/ranking";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

const PASS_PERCENT = 33; // certificate-eligibility pass threshold (policy-overridable later)

// rank within groups of a column (e.g. grade_code, subject_code) -> id -> rank
function groupRanks(rows: Array<Record<string, unknown>>, key: string): Map<string, number> {
  const groups: Record<string, Scored[]> = {};
  for (const r of rows) {
    (groups[String(r[key])] ??= []).push({ candidateId: String(r.id), score: Number(r.raw_score) });
  }
  const m = new Map<string, number>();
  for (const g of Object.values(groups)) for (const rr of rankCandidates(g)) m.set(rr.candidateId, rr.rank);
  return m;
}

async function effect_generate_results(supabase: Db, batchId: string, actor: Actor): Promise<void> {
  const { data } = await supabase.from("candidate_results").select("*").eq("result_batch_id", batchId).is("archived_at", null);
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  if (!rows.length) return;

  const national = rankCandidates(rows.map((r) => ({ candidateId: String(r.id), score: Number(r.raw_score) })));
  const nationalRank = new Map(national.map((r) => [r.candidateId, r.rank]));
  const gradeRank = groupRanks(rows, "grade_code");
  const subjectRank = groupRanks(rows, "subject_code");

  let eligibleCount = 0;
  for (const r of rows) {
    const id = String(r.id);
    const eligible = Number(r.percentage_score) >= PASS_PERCENT ? "eligible" : "not_eligible";
    if (eligible === "eligible") eligibleCount += 1;
    await supabase
      .from("candidate_results")
      .update({
        national_rank: nationalRank.get(id) ?? null,
        grade_rank: gradeRank.get(id) ?? null,
        subject_rank: subjectRank.get(id) ?? null,
        result_status: "ranked",
        certificate_eligibility_status: eligible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }
  await supabase
    .from("result_batches")
    .update({ candidate_count: rows.length, published_count: eligibleCount, updated_at: new Date().toISOString() })
    .eq("id", batchId);
  await createAuditEvent({
    sourceModule: "results_ops", action: "rank_results", actor,
    entityType: "result_batches", entityId: batchId, newStatus: "generated",
    reason: `ranked ${rows.length} candidate results (${eligibleCount} certificate-eligible)`,
  });
}

export const RESULT_DOMAIN_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  "results_ops:generate": effect_generate_results,
};
