// School-scoped reference-picker data (FR-SCHOOL-PICKERS-2026-0045). Like /api/staff/lookup, but returns
// ONLY the authenticated school's own rows — the browser-submitted school_id is never trusted, so a school
// can never pick another school's records. Tables with a school_id are filtered by it; exam_slots are
// resolved through the school's slot assignments; tables that can't be safely scoped return empty.
import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LOOKUP_LABELS } from "@/server/lookups/labelColumns.generated";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "school_dashboard";

export async function GET(request: NextRequest, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const schoolId = guard.actor.school_id;
  const labelCol = LOOKUP_LABELS[table];
  if (!labelCol || !schoolId) return NextResponse.json(ok({ items: [] }, meta(guard.requestId, MOD)));

  const supabase = createSupabaseAdminClient();
  const toItems = (rows: unknown) => ((rows ?? []) as unknown as Array<Record<string, unknown>>).map((r) => ({ value: String(r.id), label: String(r[labelCol] ?? r.id) }));

  // exam_slots have no school_id — scope through the school's slot assignments.
  if (table === "exam_slots") {
    const { data: asg } = await supabase.from("school_exam_slot_assignments").select("exam_slot_id").eq("school_id", schoolId);
    const ids = ((asg ?? []) as Array<Record<string, unknown>>).map((a) => a.exam_slot_id).filter(Boolean) as string[];
    if (!ids.length) return NextResponse.json(ok({ items: [] }, meta(guard.requestId, MOD)));
    const { data } = await supabase.from("exam_slots").select(`id, ${labelCol}`).in("id", ids).limit(1000);
    return NextResponse.json(ok({ items: toItems(data) }, meta(guard.requestId, MOD)));
  }

  // Tables with a school_id: filter by the authenticated school. If the table has no school_id, the query
  // errors and we return empty (never an unscoped, cross-school list).
  const { data, error } = await supabase.from(table).select(`id, ${labelCol}`).eq("school_id", schoolId).limit(1000);
  if (error) return NextResponse.json(ok({ items: [] }, meta(guard.requestId, MOD)));
  return NextResponse.json(ok({ items: toItems(data) }, meta(guard.requestId, MOD)));
}
