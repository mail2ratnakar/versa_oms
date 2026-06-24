import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { maskRecords } from "@/server/masking/masking";
import type { Actor } from "@/server/types";

/**
 * List a parent record's child rows for an in-screen detail panel (read-only sub-collection).
 * Masks every row for the actor (PII/private fields stay protected). Reusable by all detail panels
 * (FR-UI-HARDENING detail-panel slice). Fails soft to an empty list when the DB is unavailable.
 */
export async function listChildRecords(
  table: string,
  fkColumn: string,
  parentId: string,
  actor: Actor,
  orderBy = "created_at"
): Promise<{ items: Array<Record<string, unknown>> }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from(table).select("*").eq(fkColumn, parentId).order(orderBy, { ascending: false });
    return { items: maskRecords((data ?? []) as Array<Record<string, unknown>>, actor) };
  } catch {
    return { items: [] };
  }
}
