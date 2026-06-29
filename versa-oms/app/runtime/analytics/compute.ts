// FROZEN-KERNEL — analytics. Runtime aggregation (not source-derivable) for the staff Analytics screen: per-olympiad
// KPIs (schools, students, avg %, pass %, medal counts) + totals. Served at /api/analytics.
import { db } from "@/runtime/db";

const PASS_PCT = 33;

export async function analytics(): Promise<{ olympiads: any[]; totals: any }> {
  const [olys, parts, students, results, awards] = await Promise.all([
    db.list("olympiads"), db.list("participations"), db.list("students"), db.list("results"), db.list("awards"),
  ]) as Record<string, any>[][];

  const rows = [];
  for (const o of olys) {
    const opIds = new Set(parts.filter((p) => p.olympiad_id === o.id).map((p) => p.id));
    const schoolSet = new Set(parts.filter((p) => p.olympiad_id === o.id).map((p) => p.school_id));
    const studs = students.filter((s) => opIds.has(s.participation_id));
    const res = results.filter((r) => opIds.has(r.participation_id) && r.percentage != null);
    const avg = res.length ? res.reduce((a, r) => a + Number(r.percentage), 0) / res.length : 0;
    const passed = res.filter((r) => Number(r.percentage) >= PASS_PCT).length;
    const resIds = new Set(res.map((r) => r.id));
    const aw = awards.filter((a) => resIds.has(a.result_id));
    const medals = (t: string) => aw.filter((a) => a.award_type === t).length;
    rows.push({
      olympiad: o.name, status: o.status, schools: schoolSet.size, students: studs.length, scored: res.length,
      avg_pct: res.length ? Math.round(avg * 10) / 10 : 0,
      pass_pct: res.length ? Math.round((passed / res.length) * 1000) / 10 : 0,
      gold: medals("gold"), silver: medals("silver"), bronze: medals("bronze"), merit: medals("merit"),
    });
  }
  const totals = {
    olympiads: olys.length, schools: new Set(parts.map((p) => p.school_id)).size, students: students.length,
    scored: results.filter((r) => r.percentage != null).length,
  };
  return { olympiads: rows, totals };
}
