// Create-time guards (FRAMEWORK — FR-SLOT-CAPACITY-0013). Table-keyed precondition the kernel runs
// before INSERT (mirrors computeOnCreate). Throws ValidationError to block the create (-> 422).
// Currently: exam_slot_bookings capacity (real bookings vs the slot's seat/school limits).
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ValidationError } from "@/server/lib/defineModule";
import { checkSlotCapacity } from "@/server/lib/slotCapacity";
import type { Actor } from "@/server/types";

const ACTIVE_BOOKING = new Set(["reserved", "confirmed", "locked"]);

export async function assertCreateAllowed(table: string, payload: Record<string, unknown>, actor: Actor): Promise<void> {
  if (table !== "exam_slot_bookings") return;
  const slotId = payload.exam_slot_id as string | undefined;
  if (!slotId) return; // FK validation handles a missing slot
  const newCount = Number(payload.confirmed_student_count ?? 0);
  const schoolId = (actor.school_id as string) ?? (payload.school_id as string) ?? "";

  const supabase = createSupabaseAdminClient();
  const { data: slot } = await supabase.from("exam_slots").select("capacity_students, capacity_schools").eq("id", slotId).maybeSingle();
  if (!slot) return; // no slot to gate against (let the FK fail downstream)
  const s = slot as Record<string, unknown>;

  const { data: bookings } = await supabase
    .from("exam_slot_bookings")
    .select("school_id, confirmed_student_count, status")
    .eq("exam_slot_id", slotId)
    .is("archived_at", null);
  const active = ((bookings ?? []) as Array<Record<string, unknown>>).filter((b) => ACTIVE_BOOKING.has(String(b.status)));

  const res = checkSlotCapacity({
    capacityStudents: Number(s.capacity_students),
    capacitySchools: Number(s.capacity_schools),
    bookedStudents: active.reduce((n, b) => n + Number(b.confirmed_student_count ?? 0), 0),
    bookedSchoolIds: active.map((b) => String(b.school_id)),
    newSchoolId: schoolId,
    newCount,
  });
  if (!res.ok) throw new ValidationError([{ field: "capacity", message: res.reason ?? "Slot capacity exceeded." }]);
}
