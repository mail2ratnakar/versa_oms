import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Finance gate: a school may only progress to slot confirmation / material
 * download once payment is cleared. Safe-by-default: when payment cannot be
 * confirmed (incl. no DB), access is DENIED.
 */
const CLEARED = ["paid", "approved_credit", "approved_waiver", "confirmed"];

export async function isPaymentCleared(schoolId: string): Promise<boolean> {
  if (!schoolId) return false;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("payments").select("*").eq("school_id", schoolId).is("archived_at", null);
    if (!data || data.length === 0) return false;
    return data.some((p) => {
      const status = String((p as Record<string, unknown>).payment_status ?? (p as Record<string, unknown>).status ?? "");
      return CLEARED.includes(status);
    });
  } catch {
    return false;
  }
}
