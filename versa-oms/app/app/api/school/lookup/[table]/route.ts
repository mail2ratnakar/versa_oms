// School-scoped reference-picker data (FR-SCHOOL-PICKERS-2026-0045; relationship scoping FR-SCHOOL-SCOPE-2026-0048).
// Like /api/staff/lookup, but returns ONLY the authenticated school's own rows — the browser-submitted
// school_id is never trusted, so a school can never pick another school's records. The per-table scoping
// strategy is generated into SCHOOL_SCOPE (gen_ui.emit_school_scope):
//   direct   — the table has school_id; filter by it.
//   path     — an ownership FK chain (1+ hops) reaches a school-scoped table; walk it from the school-scoped
//              ancestor down to the target (one hop = a direct parent; many hops = a verified chain).
//   junction — reached through a hand-verified school-scoped junction (e.g. exam_slots).
//   none     — not safely school-scopable (global catalog or staff-only); return empty (never an unscoped list).
import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LOOKUP_LABELS } from "@/server/lookups/labelColumns.generated";
import { SCHOOL_SCOPE } from "@/server/lookups/schoolScope.generated";
import { ok, meta } from "@/server/http/envelope";

const MOD = "school_dashboard";
type Row = Record<string, unknown>;
const rows = (data: unknown) => (data ?? []) as unknown as Row[];

export async function GET(request: NextRequest, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const schoolId = guard.actor.school_id;
  const labelCol = LOOKUP_LABELS[table];
  const scope = SCHOOL_SCOPE[table];
  const empty = () => NextResponse.json(ok({ items: [] }, meta(guard.requestId, MOD)));
  if (!labelCol || !schoolId || !scope || scope.kind === "none") return empty();

  const supabase = createSupabaseAdminClient();
  const toItems = (data: unknown) => rows(data).map((r) => ({ value: String(r.id), label: String(r[labelCol] ?? r.id) }));
  const fetchByIds = async (ids: string[]) => {
    if (!ids.length) return empty();
    const { data } = await supabase.from(table).select(`id, ${labelCol}`).in("id", ids).limit(1000);
    return NextResponse.json(ok({ items: toItems(data) }, meta(guard.requestId, MOD)));
  };

  if (scope.kind === "direct") {
    const { data, error } = await supabase.from(table).select(`id, ${labelCol}`).eq("school_id", schoolId).limit(1000);
    if (error) return empty();
    return NextResponse.json(ok({ items: toItems(data) }, meta(guard.requestId, MOD)));
  }

  if (scope.kind === "path") {
    // Walk an ownership FK chain: start at the school-scoped ancestor (the last hop's parent), then walk
    // back down each hop, narrowing the id set, until we reach the target table.
    const hops = scope.hops;
    const { data: anc } = await supabase.from(hops[hops.length - 1].parent).select("id").eq("school_id", schoolId);
    let ids = rows(anc).map((r) => String(r.id));
    for (let i = hops.length - 1; i >= 1; i--) {
      if (!ids.length) return empty();
      const { data } = await supabase.from(hops[i - 1].parent).select("id").in(hops[i].via, ids);
      ids = rows(data).map((r) => String(r.id));
    }
    if (!ids.length) return empty();
    const { data } = await supabase.from(table).select(`id, ${labelCol}`).in(hops[0].via, ids).limit(1000);
    return NextResponse.json(ok({ items: toItems(data) }, meta(guard.requestId, MOD)));
  }

  // junction: the school's links to this table via a school-scoped junction table.
  const { data: links } = await supabase.from(scope.junction).select(scope.fk).eq("school_id", schoolId);
  const ids = rows(links).map((l) => l[scope.fk]).filter(Boolean) as string[];
  return fetchByIds(ids);
}
