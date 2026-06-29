// FROZEN-KERNEL — renewal. (a) `pastParticipantSchoolIds` powers the campaign "past_participants" segment.
// (b) `enrollNextCycle` clones a school's participation into the next cycle's olympiad (same subject, newest OPEN
// olympiad), with a fresh roster — the staff "Enroll in next cycle" action. Served at /api/participations/:id/renew.
import { db } from "@/runtime/db";

export async function pastParticipantSchoolIds(): Promise<string[]> {
  const parts = (await db.list("participations")) as Record<string, any>[];
  return [...new Set(parts.map((p) => p.school_id).filter(Boolean))];
}

export async function enrollNextCycle(participationId: string): Promise<{ ok: boolean; participation?: any; error?: string }> {
  const old = (await db.get("participations", participationId)) as Record<string, any> | null;
  if (!old) return { ok: false, error: "participation not found" };
  const olys = (await db.list("olympiads")) as Record<string, any>[];
  const cur = olys.find((o) => o.id === old.olympiad_id);
  // next cycle = newest OPEN olympiad of the same subject, other than the current one
  const candidates = olys
    .filter((o) => o.id !== old.olympiad_id && o.status === "open" && (!cur || o.subject === cur.subject))
    .sort((a, b) => String(b.academic_year || "").localeCompare(String(a.academic_year || "")));
  const next = candidates[0] || olys.filter((o) => o.id !== old.olympiad_id && o.status === "open").sort((a, b) => String(b.academic_year || "").localeCompare(String(a.academic_year || "")))[0];
  if (!next) return { ok: false, error: "no open next-cycle olympiad to enroll into" };
  // avoid duplicate enrollment
  const dup = (await db.list("participations")).find((p: any) => p.school_id === old.school_id && p.olympiad_id === next.id);
  if (dup) return { ok: false, error: "already enrolled in that cycle" };
  const created = await db.insert("participations", {
    participation_code: "PART-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
    school_id: old.school_id, olympiad_id: next.id, status: "submitted",
  });
  return { ok: true, participation: created };
}
