// FROZEN-KERNEL — rankings. After results are scored + published, rank every result of an olympiad by percentage:
// within grade (national_rank), within state x grade (state_rank), within school x grade (school_rank). Ties share a
// rank (standard competition ranking). Wired via service_hook results.publish -> rankOnPublish (recomputes the olympiad).
import { db } from "@/runtime/db";

function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) { const k = key(r); (m.get(k) || m.set(k, []).get(k)!).push(r); }
  return m;
}

function rankIn(group: Record<string, any>[], field: string): void {
  const sorted = [...group].sort((a, b) => Number(b.percentage) - Number(a.percentage));
  let rank = 0, prev: number | null = null, seen = 0;
  for (const r of sorted) {
    seen++;
    if (prev === null || Number(r.percentage) !== prev) { rank = seen; prev = Number(r.percentage); }
    r[field] = rank;                                        // ties share the rank
  }
}

export async function computeRankings(olympiadId: string): Promise<void> {
  const partIds = new Set(((await db.list("participations")) as Record<string, any>[]).filter((p) => p.olympiad_id === olympiadId).map((p) => p.id));
  const students = new Map(((await db.list("students")) as Record<string, any>[]).map((s) => [s.id, s]));
  const results = ((await db.list("results")) as Record<string, any>[]).filter((r) => partIds.has(r.participation_id) && r.percentage != null && (students.get(r.student_id) || {}).exam_attendance !== "absent");  // absent excluded from ranking
  if (!results.length) return;
  const schools = new Map(((await db.list("schools")) as Record<string, any>[]).map((s) => [s.id, s]));
  for (const r of results) {
    r._grade = students.get(r.student_id) ? String(students.get(r.student_id)!.grade) : "";
    r._state = schools.get(r.school_id) ? String(schools.get(r.school_id)!.state || "") : "";
  }
  for (const g of groupBy(results, (r) => r._grade).values()) rankIn(g, "_nat");                       // national, within grade
  for (const g of groupBy(results, (r) => r._state + "|" + r._grade).values()) rankIn(g, "_st");       // state x grade
  for (const g of groupBy(results, (r) => r.school_id + "|" + r._grade).values()) rankIn(g, "_sc");    // school x grade
  // awards: Gold/Silver/Bronze for national ranks 1-3 (per grade); Merit for the top N% of the grade
  const oly = (await db.get("olympiads", olympiadId)) as Record<string, any> | null;
  const meritPct = Number(oly && oly.merit_top_percent) || 0;
  const awardByResult = new Map(((await db.list("awards")) as Record<string, any>[]).map((a) => [a.result_id, a]));
  for (const g of groupBy(results, (r) => r._grade).values()) {
    const cutoff = meritPct > 0 ? Math.ceil((g.length * meritPct) / 100) : 0;
    for (const r of g) {
      let award: string | null = null;
      if (r._nat === 1) award = "gold"; else if (r._nat === 2) award = "silver"; else if (r._nat === 3) award = "bronze";
      else if (cutoff && r._nat <= cutoff) award = "merit";
      await db.update("results", r.id, { national_rank: r._nat, state_rank: r._st, school_rank: r._sc, award_category: award || "none" });
      const ex = awardByResult.get(r.id);
      if (award && ex) { if (ex.award_type !== award) await db.update("awards", ex.id, { award_type: award }); }
      else if (award) await db.insert("awards", { award_code: "AWD-" + crypto.randomUUID().slice(0, 8).toUpperCase(), result_id: r.id, student_id: r.student_id, school_id: r.school_id, award_type: award, status: "pending" });
    }
  }
}

export async function rankOnPublish(resultId: string): Promise<void> {
  const r = (await db.get("results", resultId)) as Record<string, any> | null;
  if (!r) return;
  const p = r.participation_id ? (await db.get("participations", r.participation_id)) as Record<string, any> : null;
  if (p) await computeRankings(p.olympiad_id);
}
