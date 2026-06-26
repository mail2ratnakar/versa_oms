// Reference-picker data (FR-NO-RAW-CRUD-UI). A single generic endpoint that returns {value, label} options
// for any FK-target table, so every reference field renders as a BUSINESS dropdown (human label) instead of
// a raw uuid box. Whitelisted to the generated LOOKUP_LABELS map (only real FK targets, with a safe label).
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LOOKUP_LABELS } from "@/server/lookups/labelColumns.generated";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "company_dashboard"; // any authenticated staff may read reference data

export async function GET(request: NextRequest, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const labelCol = LOOKUP_LABELS[table];
  if (!labelCol) return NextResponse.json(err("NOT_FOUND", "Not a reference table.", meta(guard.requestId, MOD)), { status: 404 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select(`id, ${labelCol}`).order(labelCol === "id" ? "id" : labelCol, { ascending: true }).limit(1000);
  if (error) return NextResponse.json(ok({ items: [] }, meta(guard.requestId, MOD)));
  const items = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((r) => ({ value: String(r.id), label: String(r[labelCol] ?? r.id) }));
  return NextResponse.json(ok({ items }, meta(guard.requestId, MOD)));
}
