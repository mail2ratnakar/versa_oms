import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Dual-approval (maker != checker) tracking. A high-risk transition is only
 * applied once TWO DISTINCT approvers have recorded an approval for the same
 * (table, record, action). The same actor approving twice still counts as one,
 * so no one can self-approve a two-person action.
 *
 * Backed by the `approvals` table (migration 0004) with an in-memory fallback so
 * the rule is enforceable and testable before a live database is wired.
 */
const memory = new Map<string, Set<string>>();
const keyOf = (table: string, id: string, action: string) => `${table}::${id}::${action}`;

export type ApprovalState = { distinct: number; approvers: string[] };

export async function recordApproval(
  table: string,
  recordId: string,
  action: string,
  approverId: string,
  approverRole: string,
  reason: string | null
): Promise<ApprovalState> {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("approvals")
      .upsert(
        { table_name: table, record_id: recordId, action, approver_id: approverId, approver_role: approverRole, reason },
        { onConflict: "table_name,record_id,action,approver_id", ignoreDuplicates: true }
      );
    const { data, error } = await supabase
      .from("approvals")
      .select("approver_id")
      .eq("table_name", table)
      .eq("record_id", recordId)
      .eq("action", action);
    if (error) throw error;
    const ids = Array.from(new Set((data ?? []).map((r) => r.approver_id as string)));
    if (ids.length > 0) return { distinct: ids.length, approvers: ids };
    throw new Error("no_rows");
  } catch {
    const k = keyOf(table, recordId, action);
    const set = memory.get(k) ?? new Set<string>();
    set.add(approverId);
    memory.set(k, set);
    return { distinct: set.size, approvers: Array.from(set) };
  }
}

/** Test helper: clear the in-memory approval state. */
export function resetApprovalsMemory(): void {
  memory.clear();
}
