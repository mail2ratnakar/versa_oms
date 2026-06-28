// FROZEN-KERNEL — admit cards. When a participation's roster is finalised, generate one admit card per student
// (candidate id, exam slot, venue). Idempotent. Wired via service_hook participations.finalise -> generateAdmitCards.
import { db } from "@/runtime/db";

export async function generateAdmitCards(participationId: string): Promise<void> {
  const part = (await db.get("participations", participationId)) as Record<string, any> | null;
  if (!part) return;
  const students = ((await db.list("students")) as Record<string, any>[]).filter((s) => s.participation_id === participationId);
  if (!students.length) return;
  const slot = part.exam_slot_id ? (await db.get("exam_slots", part.exam_slot_id)) as Record<string, any> | null : null;
  const venue = slot ? String(slot.venue || slot.centre || slot.location || "") : "";
  const existing = new Set(((await db.list("admit_cards")) as Record<string, any>[]).filter((a) => a.participation_id === participationId).map((a) => a.student_id));
  for (const s of students) {
    if (existing.has(s.id)) continue;                       // idempotent — don't duplicate on re-finalise
    await db.insert("admit_cards", {
      admit_card_code: "ADM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      student_id: s.id, participation_id: participationId, school_id: s.school_id || part.school_id || null, exam_slot_id: part.exam_slot_id || null,
      candidate_id: s.candidate_id || null, venue, status: "generated",
    });
  }
}
