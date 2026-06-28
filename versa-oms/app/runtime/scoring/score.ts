// FROZEN-KERNEL — OMR scoring. Score a result's per-question responses against the published answer key for its
// olympiad x grade, applying the olympiad's negative-marking config. Wired via service_hook results.review_results.
// Pure scoring (scoreResponses) is unit-testable; scoreResult resolves the key + writes raw_score/max_marks/percentage.
import { db } from "@/runtime/db";

type Resp = { q: number | string; option: string };
type KeyItem = { q: number | string; option: string; marks: number };

export function scoreResponses(responses: Resp[], key: KeyItem[], negEnabled: boolean, negMarks: number): { raw: number; max: number } {
  const km = new Map(key.map((k) => [String(k.q), k]));
  let raw = 0, max = 0;
  for (const k of key) max += Number(k.marks) || 0;
  for (const r of responses || []) {
    const k = km.get(String(r.q));
    if (!k) continue;
    if (String(r.option) === String(k.option)) raw += Number(k.marks) || 0;
    else if (negEnabled) raw -= Number(negMarks) || 0;
  }
  return { raw, max };
}

function asJson(v: unknown): any[] {
  if (!v) return [];
  return typeof v === "string" ? JSON.parse(v) : (v as any[]);
}

export async function scoreResult(resultId: string): Promise<void> {
  const res = (await db.get("results", resultId)) as Record<string, any> | null;
  if (!res) return;
  const student = res.student_id ? (await db.get("students", res.student_id)) as Record<string, any> : null;
  const part = res.participation_id ? (await db.get("participations", res.participation_id)) as Record<string, any> : null;
  if (!student || !part) return;
  const keys = ((await db.list("answer_keys")) as Record<string, any>[]).filter(
    (k) => k.olympiad_id === part.olympiad_id && String(k.grade) === String(student.grade) && k.status === "published");
  if (!keys.length) return;                                  // no published key yet — leave the score untouched
  const oly = (await db.get("olympiads", part.olympiad_id)) as Record<string, any> | null;
  const { raw, max } = scoreResponses(asJson(res.responses), asJson(keys[0].key), !!(oly && oly.negative_marking_enabled), Number(oly && oly.negative_marks) || 0);
  const pct = max > 0 ? Math.round((raw / max) * 10000) / 100 : 0;
  await db.update("results", resultId, { raw_score: raw, max_marks: max, percentage: pct });
}
