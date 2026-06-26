// Reference-picker data (FR-NO-RAW-CRUD-UI; search/pagination FR-LOOKUP-SEARCH-2026-0050). A single generic
// endpoint that returns {value, label} options for any FK-target table, so every reference field renders as a
// BUSINESS dropdown (human label) instead of a raw uuid box. Whitelisted to the generated LOOKUP_LABELS map.
// Supports ?q= (server-side label search, ilike) and ?limit= (default 50; +1 probed for hasMore) so large
// option sets stay fast and never ship thousands of rows to the browser.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LOOKUP_LABELS } from "@/server/lookups/labelColumns.generated";
import { ok, err, meta } from "@/server/http/envelope";
import { lookupQuery, lookupResult, escapeLike } from "@/server/lookups/query";

const MOD = "company_dashboard"; // any authenticated staff may read reference data

export async function GET(request: NextRequest, ctx: { params: Promise<{ table: string }> }) {
  const { table } = await ctx.params;
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const labelCol = LOOKUP_LABELS[table];
  if (!labelCol) return NextResponse.json(err("NOT_FOUND", "Not a reference table.", meta(guard.requestId, MOD)), { status: 404 });

  const { q, limit } = lookupQuery(request);
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select(`id, ${labelCol}`);
  if (q && labelCol !== "id") query = query.ilike(labelCol, `%${escapeLike(q)}%`);
  const { data, error } = await query.order(labelCol === "id" ? "id" : labelCol, { ascending: true }).limit(limit + 1);
  if (error) return NextResponse.json(ok({ items: [], hasMore: false }, meta(guard.requestId, MOD)));
  return NextResponse.json(ok(lookupResult(data, labelCol, limit), meta(guard.requestId, MOD)));
}
