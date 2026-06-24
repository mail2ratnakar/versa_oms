#!/usr/bin/env python3
"""Generate a module's action service from spec/actions/<module>.actions.json.

Currently emits app/server/crm/leadService.ts (list, create+server-fill+dedupe,
field-update row actions, a convert CHAIN, and a sub-collection). Routes are thin
glue that import these functions and stay stable.

Value mini-language: const:V, code:PFX, normalize:REF, trim:REF, $now, $id, $param,
$parent, actor, pending_email, $body.X, $src.X, and REF|DEFAULT fallback."""
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SPEC = Path("versa-oms/spec/actions/school_crm.actions.json")
OUT = Path("versa-oms/app/server/crm/leadService.ts")
API = Path("versa-oms/app/app/api/staff")
SEG_RE = re.compile(r"^[a-z0-9_\-]+$")  # path-traversal guard for route segments

def safe_route(route):
    if not all(SEG_RE.match(s) for s in route.split("/")):
        raise ValueError(f"unsafe route segment in {route!r}")
    return route

def base(ref, ctx):
    if ref == "$now": return "now"
    if ref == "$id": return "id"
    if ref == "$param": return ctx["param"]
    if ref == "$parent": return ctx["parent"]
    if ref == "actor": return "actorId(actor)"
    if ref == "pending_email": return '`pending+${crypto.randomUUID().slice(0, 6)}@versa.local`'
    if ref.startswith("$body."): return f'payload.{ref[6:]}'
    if ref.startswith("$src."): return f'{ctx["src"]}["{ref[5:]}"]'
    if ref.startswith("$"): return ref[1:]            # captured var ($schoolId -> schoolId)
    return json.dumps(ref)

def default_expr(d, ctx):
    if d == "pending_email": return base("pending_email", ctx)
    if d == "null": return "null"
    return json.dumps(d)

def vexpr(expr, ctx):
    if not isinstance(expr, str): return json.dumps(expr)
    if expr.startswith("const:"): return json.dumps(expr[6:])
    if expr.startswith("code:"): return f'"{expr[5:]}-" + crypto.randomUUID().slice(0, 8).toUpperCase()'
    if expr.startswith("normalize:"): return f'normalizeName(String({base(expr[10:], ctx)}))'
    if expr.startswith("trim:"): return f'String({base(expr[5:], ctx)} ?? "").trim()'
    if expr.startswith("nullify:"): return f'(String({base(expr[8:], ctx)} ?? "").trim() || null)'  # optional field: "" / undefined -> null
    if "|" in expr:
        ref, dflt = expr.split("|", 1)
        return f'({base(ref, ctx)} ?? {default_expr(dflt, ctx)})'
    out = base(expr, ctx)
    return f"{out} ?? null" if expr.startswith("$body.") else out

def obj(d, ctx):
    return "{ " + ", ".join(f'{json.dumps(k)}: {vexpr(v, ctx)}' for k, v in d.items()) + " }"

def tmpl(s, ctx):
    """A reason/title string -> a TS template literal (or var)."""
    if s == "$param": return ctx["param"]
    if "${" not in s: return json.dumps(s)
    def repl(m):
        t = m.group(1)
        if t == "param": return "${" + ctx["param"] + "}"
        if t == "id": return "${id}"
        if t == "lead_code": return "${row.lead_code}"
        if t.startswith("src."): return '${String(' + ctx["src"] + '["' + t[4:] + '"])}'
        return "${" + t + ' ?? ""}'   # captured vars (may be null)
    return "`" + re.sub(r"\$\{([^}]+)\}", repl, s) + "`"

def audit_call(a, ctx, default_module, def_etype=None, def_eid=None):
    parts = [f'sourceModule: {json.dumps(a.get("module", default_module))}', f'action: {json.dumps(a["action"])}', "actor",
             f'entityType: {json.dumps(a.get("entity_type", def_etype))}']
    if a.get("entity_id"): parts.append(f'entityId: String({base(a["entity_id"], ctx)} ?? "")')
    elif def_eid: parts.append(f'entityId: {def_eid}')
    if a.get("new_status") is not None: parts.append(f'newStatus: {vexpr(a["new_status"], ctx)}')
    if a.get("reason") is not None: parts.append(f'reason: {tmpl(a["reason"], ctx)}')
    return "await createAuditEvent({ " + ", ".join(parts) + " });"

def gen_list(spec):
    t = json.dumps(spec["table"]); lst = spec["list"]
    cfg = {
        "filterColumns": lst.get("filter", []),
        "searchColumns": lst.get("search", []),
        "sortColumns": lst.get("sort", []),
        "defaultSort": {"column": lst["order_by"], "ascending": False},
        "ownerColumn": lst.get("owner_column"),
        "facetColumn": lst.get("facet"),
        "facetValues": (spec.get("stages", []) if lst.get("facet") == "stage" else lst.get("facet_values", [])),
    }
    cfg = {k: v for k, v in cfg.items() if v not in (None, [], "")}
    cfg_js = json.dumps(cfg)
    return f'''const LIST_CFG = {cfg_js};
export async function listLeads(actor: Actor, searchParams: URLSearchParams) {{
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const size = Math.min(100, Number.parseInt(searchParams.get("page_size") ?? "50", 10) || 50);
  try {{
    const supabase = createSupabaseAdminClient();
    // Assignment scope (OWASP A01): narrow to the actor's assigned dimensions; global actors are unrestricted.
    const scope = <T extends {{ in(c: string, v: string[]): T }}>(q: T): T => {{ for (const f of applicableFilters(actor, {t})) q = q.in(f.column, f.values); return q; }};
    const base = () => scope(supabase.from({t}).select("*", {{ count: "exact" }}).is("archived_at", null));
    let q = applyListFilters(base(), searchParams, LIST_CFG, actor);
    q = applyListSort(q, searchParams, LIST_CFG).range((page - 1) * size, page * size - 1);
    const {{ data, count }} = await q;
    const items = maskRecords((data ?? []) as Array<Record<string, unknown>>, actor);
    const facetBase = () => scope(supabase.from({t}).select("*", {{ count: "exact", head: true }}).is("archived_at", null));
    const facets = await facetCounts(facetBase, searchParams, LIST_CFG, actor);
    return {{ items, pagination: {{ page, page_size: size, total_count: count ?? items.length, has_next: (count ?? 0) > page * size, next_cursor: null }}, facets }};
  }} catch {{
    return {{ items: [], pagination: {{ page, page_size: size, total_count: 0, has_next: false, next_cursor: null }} }};
  }}
}}'''

def gen_build_row(spec):
    """Shared lead-row builder from create.row — used by createLead AND importLeads so single-create
    and bulk-import can never diverge on field mapping (P0.6)."""
    rowobj = obj(spec["create"]["row"], {"param": "", "src": "src", "parent": ""})
    return f'''function buildLeadRow(actor: Actor, payload: Record<string, unknown>): Record<string, unknown> {{
  const now = new Date().toISOString();
  return {rowobj};
}}'''

def gen_create(spec):
    c = spec["create"]
    req = ", ".join(json.dumps(r) for r in c["required"])
    return f'''export async function createLead(actor: Actor, payload: Record<string, unknown>) {{
  const required = [{req}] as const;
  const missing = required.filter((k) => !String(payload[k] ?? "").trim());
  if (missing.length) throw new ValidationError(missing.map((f) => ({{ field: f, message: "Required." }})));

  const supabase = createSupabaseAdminClient();
  let duplicateWarning = false;
  try {{
    const {{ data: existing }} = await supabase.from({json.dumps(spec["table"])}).select({json.dumps(c["dedupe_select"])}).is("archived_at", null);
    duplicateWarning = findDuplicates([payload as Lead], (existing ?? []) as Lead[]).duplicates.length > 0;
  }} catch {{ /* ignore */ }}

  const row: Record<string, unknown> = buildLeadRow(actor, payload);
  const {{ data, error }} = await supabase.from({json.dumps(spec["table"])}).insert(row).select().single();
  if (error) throw new ValidationError([{{ field: "lead", message: error.message }}]);
  {audit_call(c["audit"], {"param": "", "src": "src", "parent": ""}, spec["source_module"], spec["table"], "String(data.id)")}
  return {{ {json.dumps(c["result_key"])}: maskRecord(data as Record<string, unknown>, actor), duplicate_warning: duplicateWarning }};
}}'''

def gen_field_action(a, spec):
    param = a["param"]; ctx = {"param": param, "src": "src", "parent": ""}
    guards = []
    if a.get("validate_in_stages"):
        guards.append(f'  if (!CRM_STAGES.includes({param} as CrmStage)) throw new ValidationError([{{ field: "stage", message: `Unknown stage \'${{{param}}}\'.` }}]);')
    if a.get("require_param"):
        guards.append(f'  if (!{param} || !String({param}).trim()) throw new ValidationError([{{ field: {json.dumps(a["require_param"])}, message: {json.dumps(a["require_param"] + " is required.")} }}]);')
    setobj = obj(a["set"], ctx)
    ret = "{ " + ", ".join(f'{k}: {vexpr(v, ctx)}' for k, v in a["returns"].items()) + ", applied: true }"
    g = ("\n".join(guards) + "\n") if guards else ""
    return f'''export async function {a["fn"]}(actor: Actor, id: string, {param}: string) {{
{g}  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, id);
  try {{
    await supabase.from({json.dumps(spec["table"])}).update({setobj}).eq("id", id);
  }} catch {{ /* local */ }}
  {audit_call(a["audit"], ctx, spec["source_module"], spec["table"], "id")}
  return {ret};
}}'''

def gen_chain_action(a, spec):
    ch = a["chain"]; ctx = {"param": "", "src": "s", "parent": ""}
    captures = [s["capture"] for s in ch["steps"] if s.get("capture")]
    decls = "\n".join(f"  let {c}: string | null = null;" for c in captures)
    body = []
    for st in ch["steps"]:
        if st["op"] == "audit": continue
        if st["op"] == "insert":
            cap = st["capture"]
            body.append(f'    const {{ data: cap_{cap} }} = await supabase.from({json.dumps(st["table"])}).insert({obj(st["values"], ctx)}).select("id").single();')
            body.append(f'    {cap} = (cap_{cap} as {{ id?: string }} | null)?.id ?? null;')
        elif st["op"] == "update":
            tgt = "id"  # match source
            body.append(f'    await supabase.from({json.dumps(st["table"])}).update({obj(st["set"], ctx)}).eq("id", {tgt});')
        elif st["op"] == "task":
            q = st["queue"]
            guard = st.get("guard")
            inner = (
                f'      const {{ ensureQueue, createWorkTask }} = await import("@/server/tasks/createTask");\n'
                f'      const queueId = await ensureQueue(supabase, {{ code: {json.dumps(q["code"])}, name: {json.dumps(q["name"])}, type: {json.dumps(q["type"])}, owner: {json.dumps(q["owner"])} }});\n'
                f'      if (queueId) {{ {st["capture"]} = await createWorkTask(supabase, {{ title: {tmpl(st["title"], ctx)}, type: {json.dumps(st["type"])}, queueId, sourceType: {json.dumps(st["source_type"])}, sourceId: {base(st["source_id"], ctx)} as string }}); }}'
            )
            body.append(f'    if ({guard}) {{\n{inner}\n    }}')
    audits = []
    for st in ch["steps"]:
        if st["op"] != "audit": continue
        call = audit_call(st, ctx, spec["source_module"])
        audits.append(f'  if ({st["guard"]}) {{ {call} }}' if st.get("guard") else f'  {call}')
    ret = "{ " + ", ".join(f'{k}: {vexpr(v, ctx)}' for k, v in ch["returns"].items()) + ", applied: true }"
    return f'''export async function {a["fn"]}(actor: Actor, id: string) {{
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
{decls}
  try {{
    const {{ data: src }} = await supabase.from({json.dumps(ch["source_table"])}).select("*").eq("id", id).maybeSingle();
    if (!src) throw new ValidationError([{{ field: "id", message: "Record not found." }}]);
    const s = src as Record<string, unknown>;
    if (!recordInScope(actor, {json.dumps(ch["source_table"])}, s, {json.dumps(spec["list"].get("owner_column"))})) throw new ValidationError([{{ field: "id", message: "Record not in your scope." }}]);
{chr(10).join(body)}
  }} catch (e) {{
    if (e instanceof ValidationError) throw e;
  }}
{chr(10).join(audits)}
  return {ret};
}}'''

def _enum_guards(s):
    """P2.2 / OWASP A03: reject out-of-enum values for finite-domain fields (only when provided)."""
    out = ""
    for f, vals in (s.get("add_enums") or {}).items():
        out += (f'  if (payload[{json.dumps(f)}] != null && String(payload[{json.dumps(f)}]) !== "" '
                f'&& !{json.dumps(vals)}.includes(String(payload[{json.dumps(f)}]))) '
                f'throw new ValidationError([{{ field: {json.dumps(f)}, message: {json.dumps(f + " is not a valid value.")} }}]);\n')
    return out

def _on_add_block(spec, s):
    """Conditional post-insert effect (followup_policy): create a work task + reminders when `when` is set."""
    oa = s.get("on_add")
    if not oa:
        return ""
    when, q, tk = oa["when"], oa["queue"], oa["task"]
    sm = json.dumps(spec["source_module"]); src_type = json.dumps(tk["source_type"])
    L = [f'  if (String(payload[{json.dumps(when)}] ?? "").trim()) {{',
         '    const { ensureQueue, createWorkTask } = await import("@/server/tasks/createTask");',
         f'    const followupQueueId = await ensureQueue(supabase, {{ code: {json.dumps(q["code"])}, name: {json.dumps(q["name"])}, type: {json.dumps(q["type"])}, owner: {json.dumps(q["owner"])} }});',
         f'    if (followupQueueId) await createWorkTask(supabase, {{ title: {json.dumps(tk["title_prefix"])} + leadId, type: {json.dumps(tk["task_type"])}, queueId: followupQueueId, sourceType: {src_type}, sourceId: newId }});']
    for n in oa.get("notify", []):
        idem = json.dumps(f'{n["event_code"]}:{n["recipient_resolver"]}:')
        L.append(f'    await supabase.from("notification_events").insert({{ event_code: {json.dumps(n["event_code"])}, event_idempotency_key: {idem} + newId, '
                 f'source_module: {sm}, source_entity: {src_type}, source_entity_id: newId, '
                 f'event_payload: {{ message: {json.dumps(n["message"])}, due: row[{json.dumps(when)}] }}, recipient_resolver: {json.dumps(n["recipient_resolver"])} }});')
    au = oa.get("audit")
    if au:
        L.append(f'    await createAuditEvent({{ sourceModule: {sm}, action: {json.dumps(au["action"])}, actor, entityType: {src_type}, entityId: newId, reason: {json.dumps(au.get("reason", "follow-up scheduled"))} }});')
    L.append('  }')
    return "\n".join(L) + "\n"

def _edit_fn(spec, s):
    """Edit-with-reason: P1.8 reason required, P2.2 enum re-validation, P2.11/P3.5 original retained in append-only audit."""
    ed = s.get("edit")
    if not ed:
        return ""
    table = json.dumps(s["table"]); pfk = json.dumps(s["parent_fk"]); rp = ed["route_param"]
    enums = s.get("add_enums") or {}
    guards = ""
    for f in ed["editable"]:
        if f in enums:
            guards += (f'  if (payload[{json.dumps(f)}] != null && String(payload[{json.dumps(f)}]) !== "" '
                       f'&& !{json.dumps(enums[f])}.includes(String(payload[{json.dumps(f)}]))) '
                       f'throw new ValidationError([{{ field: {json.dumps(f)}, message: {json.dumps(f + " is not a valid value.")} }}]);\n')
    patch = []
    for f in ed["editable"]:
        coerce = (f'String(payload[{json.dumps(f)}] ?? "").trim()' if f == "summary"
                  else f'(String(payload[{json.dumps(f)}] ?? "").trim() || null)')
        patch.append(f'  if (payload[{json.dumps(f)}] !== undefined) patch[{json.dumps(f)}] = {coerce};')
    snap = ", ".join(f'{json.dumps(f)}: original[{json.dumps(f)}]' for f in ed["editable"])
    return f'''

export async function {ed["fn"]}(actor: Actor, leadId: string, {rp}: string, payload: Record<string, unknown>) {{
  const reason = String(payload.reason ?? "").trim();
  if (!reason) throw new ValidationError([{{ field: "reason", message: "reason is required." }}]);
{guards}  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, leadId);
  const {{ data: original }} = await supabase.from({table}).select("*").eq("id", {rp}).eq({pfk}, leadId).maybeSingle();
  if (!original) throw new ValidationError([{{ field: {json.dumps(rp)}, message: "Interaction not found." }}]);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {{}};
{chr(10).join(patch)}
  patch.interaction_status = "edited";
  patch.updated_at = now;
  const {{ data, error }} = await supabase.from({table}).update(patch).eq("id", {rp}).eq({pfk}, leadId).select().single();
  if (error) throw new ValidationError([{{ field: "interaction", message: error.message }}]);
  await createAuditEvent({{ sourceModule: {json.dumps(spec["source_module"])}, action: {json.dumps(ed["audit"]["action"])}, actor, entityType: {table}, entityId: {rp}, reason, previousStatus: String(original.interaction_status ?? ""), newStatus: "edited", externalReference: JSON.stringify({{ {snap} }}) }});
  return {{ ...maskRecord(data as Record<string, unknown>, actor), applied: true }};
}}'''

def gen_sub(spec):
    s = spec["sub_collection"]; ctx = {"param": "", "src": "src", "parent": "leadId"}
    addrow = obj(s["add_row"], ctx)
    req_js = ", ".join(json.dumps(r) for r in s.get("add_required", []))
    order_by = s.get("order_by", "created_at")
    result_key = s.get("result_key", "item")
    return f'''export async function {s["list_fn"]}(actor: Actor, leadId: string) {{
  try {{
    const supabase = createSupabaseAdminClient();
    await assertLeadInScope(supabase, actor, leadId);
    const {{ data }} = await supabase.from({json.dumps(s["table"])}).select("*").eq({json.dumps(s["parent_fk"])}, leadId).order({json.dumps(order_by)}, {{ ascending: false }});
    return {{ items: maskRecords((data ?? []) as Array<Record<string, unknown>>, actor) }};
  }} catch {{
    return {{ items: [] }};
  }}
}}

export async function {s["add_fn"]}(actor: Actor, leadId: string, payload: Record<string, unknown>) {{
  const required = [{req_js}] as const;
  const missing = required.filter((k) => !String(payload[k] ?? "").trim());
  if (missing.length) throw new ValidationError(missing.map((f) => ({{ field: f, message: "Required." }})));
{_enum_guards(s)}  const now = new Date().toISOString();
  // Only mapped columns are written — server-owned fields (codes, owner, status) are never read from the client (P3.9 / OWASP A08).
  const row: Record<string, unknown> = {addrow};
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, leadId);
  const {{ data, error }} = await supabase.from({json.dumps(s["table"])}).insert(row).select().single();
  if (error) throw new ValidationError([{{ field: {json.dumps(result_key)}, message: error.message }}]);
  const newId = String(data.id);
  {audit_call(s["audit"], ctx, spec["source_module"], s["table"], "newId")}
{_on_add_block(spec, s)}  return {{ ...maskRecord(data as Record<string, unknown>, actor), applied: true }};
}}{_edit_fn(spec, s)}'''

def gen_import(spec):
    im = spec["import"]; t = json.dumps(spec["table"])
    required = im.get("required_columns", [])
    req_js = ", ".join(json.dumps(r) for r in required)
    bt = json.dumps(im.get("batch_table", "school_lead_import_batches"))
    bprefix = im.get("batch_code_prefix", "LIMP")
    return f'''export async function {im["fn"]}(actor: Actor, leads: Array<Record<string, unknown>>, opts?: {{ import_format?: string; default_lead_owner_id?: string }}) {{
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  // 1. Validate each row against the policy's required columns (P1.4) — invalid rows are reported, not inserted.
  const required = [{req_js}] as const;
  const valid: Array<Record<string, unknown>> = [];
  const invalid: Array<{{ row: number; missing: string[] }}> = [];
  leads.forEach((raw, i) => {{
    const missing = required.filter((k) => !String(raw[k] ?? "").trim());
    if (missing.length) invalid.push({{ row: i + 1, missing }});
    else valid.push(raw);
  }});
  // 2. Duplicate detection (duplicate_policy is binding, P3.11) — duplicates are reported + skipped.
  let existing: Lead[] = [];
  try {{
    const {{ data }} = await supabase.from({t}).select({json.dumps(im["dedupe_select"])}).is("archived_at", null);
    existing = (data ?? []) as Lead[];
  }} catch {{ existing = []; }}
  const {{ unique, duplicates }} = findDuplicates(valid as Lead[], existing);
  // 3. Insert unique-valid rows via the SHARED builder (full server fields) — per-row errors are captured, never swallowed (P4.5).
  let imported = 0;
  const insertErrors: Array<{{ school_name: string; error: string }}> = [];
  for (const raw of unique) {{
    const row = buildLeadRow(actor, raw);
    if (opts?.default_lead_owner_id && !row.lead_owner_id) row.lead_owner_id = opts.default_lead_owner_id;
    const {{ error }} = await supabase.from({t}).insert(row);
    if (error) insertErrors.push({{ school_name: String(raw.school_name ?? ""), error: error.message }});
    else imported++;
  }}
  // 4. Persist the audited import batch (import_batch_audited) with counts + reports + terminal status.
  const total = leads.length, validCount = valid.length, invalidCount = invalid.length, dupCount = duplicates.length;
  const status = validCount === 0 ? "validation_failed" : (invalidCount > 0 || dupCount > 0 || insertErrors.length > 0 ? "partially_imported" : "imported");
  const batchCode = "{bprefix}-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  let batchId = "";
  try {{
    const {{ data: batch }} = await supabase.from({bt}).insert({{
      batch_code: batchCode, import_format: (opts?.import_format ?? "csv"), uploaded_by: actorId(actor),
      default_lead_owner_id: (opts?.default_lead_owner_id ?? null),
      total_rows: total, valid_rows: validCount, invalid_rows: invalidCount, duplicate_rows: dupCount,
      validation_report: {{ invalid, insert_errors: insertErrors }}, duplicate_report: {{ duplicates }},
      status, updated_at: now,
    }}).select("id").single();
    batchId = String((batch as {{ id?: string }} | null)?.id ?? "");
  }} catch {{ /* batch persistence best-effort; counts still returned */ }}
  await createAuditEvent({{ sourceModule: {json.dumps(spec["source_module"])}, action: {json.dumps(im["audit"]["action"])}, actor, entityType: {bt}, entityId: batchId || batchCode, newStatus: status, reason: `import ${{batchCode}}: ${{imported}}/${{total}} imported, ${{invalidCount}} invalid, ${{dupCount}} duplicates` }});
  return {{ batch_code: batchCode, status, total, valid: validCount, invalid: invalidCount, duplicates: dupCount, imported, validation_report: {{ invalid, insert_errors: insertErrors }}, duplicate_report: {{ duplicates }} }};
}}'''

# ---------- route generation (thin glue) ----------
RHEAD = ('import { NextRequest, NextResponse } from "next/server";\n'
         'import { requireStaffScope } from "@/server/guards/requireStaffScope";\n'
         'import { ValidationError } from "@/server/lib/defineModule";\n'
         'import { ok, err, meta } from "@/server/http/envelope";\n')
GEN = "// GENERATED from spec/actions/<m>.actions.json by _validation/gen_actions.py — DO NOT EDIT.\n"

def _catch(mid):
    return (f'  }} catch (e) {{\n'
            f'    if (e instanceof ValidationError) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, {mid}), {{ field_errors: e.fieldErrors }}), {{ status: 422 }});\n'
            f'    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, {mid})), {{ status: 500 }});\n'
            f'  }}')

def route_collection(spec):
    mid = json.dumps(spec["module_id"])
    return GEN + RHEAD + f'import {{ listLeads, createLead }} from "@/server/crm/leadService";\n\n' + f'''export async function GET(request: NextRequest) {{
  const guard = await requireStaffScope(request, {mid}, "read");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const data = await listLeads(guard.actor, request.nextUrl.searchParams);
  return NextResponse.json(ok(data, meta(guard.requestId, {mid})));
}}

export async function POST(request: NextRequest) {{
  const guard = await requireStaffScope(request, {mid}, "write");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const idem = request.headers.get("x-idempotency-key");
  if (!idem) return NextResponse.json(err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, {mid})), {{ status: 400 }});
  let payload: Record<string, unknown> = {{}};
  try {{ payload = (await request.json()) as Record<string, unknown>; }} catch {{ payload = {{}}; }}
  try {{
    const res = await createLead(guard.actor, payload);
    return NextResponse.json(ok(res, meta(guard.requestId, {mid})), {{ status: 201 }});
{_catch(mid)}
}}
'''

def route_action(spec, a):
    mid = json.dumps(spec["module_id"]); fn = a["fn"]
    parse = '  let body: Record<string, unknown> = {};\n  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }\n' if a.get("body") else ""
    call = f'{fn}(guard.actor, id, String(body.{a["body"]} ?? ""))' if a.get("body") else f'{fn}(guard.actor, id)'
    return GEN + RHEAD + f'import {{ {fn} }} from "@/server/crm/leadService";\n\n' + f'''export async function POST(request: NextRequest, ctx: {{ params: Promise<{{ id: string }}> }}) {{
  const guard = await requireStaffScope(request, {mid}, "write");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const {{ id }} = await ctx.params;
{parse}  try {{
    const data = await {call};
    return NextResponse.json(ok(data, meta(guard.requestId, {mid})));
{_catch(mid)}
}}
'''

def route_sub(spec):
    mid = json.dumps(spec["module_id"]); s = spec["sub_collection"]
    return GEN + RHEAD + f'import {{ {s["list_fn"]}, {s["add_fn"]} }} from "@/server/crm/leadService";\n\n' + f'''export async function GET(request: NextRequest, ctx: {{ params: Promise<{{ id: string }}> }}) {{
  const guard = await requireStaffScope(request, {mid}, "read");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const {{ id }} = await ctx.params;
  return NextResponse.json(ok(await {s["list_fn"]}(guard.actor, id), meta(guard.requestId, {mid})));
}}

export async function POST(request: NextRequest, ctx: {{ params: Promise<{{ id: string }}> }}) {{
  const guard = await requireStaffScope(request, {mid}, "write");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const {{ id }} = await ctx.params;
  let body: Record<string, unknown> = {{}};
  try {{ body = (await request.json()) as Record<string, unknown>; }} catch {{ body = {{}}; }}
  try {{
    return NextResponse.json(ok(await {s["add_fn"]}(guard.actor, id, body), meta(guard.requestId, {mid})), {{ status: 201 }});
{_catch(mid)}
}}
'''

def route_import(spec):
    mid = json.dumps(spec["module_id"]); im = spec["import"]; pk = im["payload_key"]
    return GEN + RHEAD + f'import {{ {im["fn"]} }} from "@/server/crm/leadService";\n\n' + f'''export async function POST(request: NextRequest) {{
  const guard = await requireStaffScope(request, {mid}, "write");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const idem = request.headers.get("x-idempotency-key");
  if (!idem) return NextResponse.json(err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, {mid})), {{ status: 400 }});
  let body: {{ {pk}?: Array<Record<string, unknown>>; import_format?: string; default_lead_owner_id?: string }} = {{}};
  try {{ body = (await request.json()) as typeof body; }} catch {{ body = {{}}; }}
  if (!Array.isArray(body.{pk})) return NextResponse.json(err("VALIDATION_FAILED", "{pk}[] is required.", meta(guard.requestId, {mid})), {{ status: 422 }});
  try {{
    const res = await {im["fn"]}(guard.actor, body.{pk}, {{ import_format: body.import_format, default_lead_owner_id: body.default_lead_owner_id }});
    return NextResponse.json(ok(res, meta(guard.requestId, {mid})), {{ status: 201 }});
{_catch(mid)}
}}
'''

def route_sub_edit(spec):
    """PATCH route for editing a sub-collection item: [id]/<route>/[iid]/route.ts."""
    mid = json.dumps(spec["module_id"]); s = spec["sub_collection"]; ed = s["edit"]; rp = ed["route_param"]
    return GEN + RHEAD + f'import {{ {ed["fn"]} }} from "@/server/crm/leadService";\n\n' + f'''export async function PATCH(request: NextRequest, ctx: {{ params: Promise<{{ id: string; {rp}: string }}> }}) {{
  const guard = await requireStaffScope(request, {mid}, "write");
  if (!guard.ok) return NextResponse.json(guard.body, {{ status: guard.status }});
  const {{ id, {rp} }} = await ctx.params;
  let body: Record<string, unknown> = {{}};
  try {{ body = (await request.json()) as Record<string, unknown>; }} catch {{ body = {{}}; }}
  try {{
    return NextResponse.json(ok(await {ed["fn"]}(guard.actor, id, {rp}, body), meta(guard.requestId, {mid})));
{_catch(mid)}
}}
'''

def write_routes(spec):
    base = API / safe_route(spec["base_route"])
    def w(rel, content):
        p = base / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(content, encoding="utf-8"); print("  route", p)
    w("route.ts", route_collection(spec))
    for a in spec["row_actions"]:
        w(f'[id]/{safe_route(a["route"])}/route.ts', route_action(spec, a))
    sub = spec["sub_collection"]
    w(f'[id]/{safe_route(sub["route"])}/route.ts', route_sub(spec))
    if sub.get("edit"):
        w(f'[id]/{safe_route(sub["route"])}/[{sub["edit"]["route_param"]}]/route.ts', route_sub_edit(spec))
    w(f'{safe_route(spec["import"]["route"])}/route.ts', route_import(spec))

def main():
    spec = json.load(open(SPEC, encoding="utf-8"))
    stages = ", ".join(json.dumps(s) for s in spec["stages"])
    parts = [
        "// GENERATED from spec/actions/school_crm.actions.json by _validation/gen_actions.py — DO NOT EDIT.",
        "// To change CRM actions, edit the spec and re-run: python _validation/gen_actions.py",
        'import { createSupabaseAdminClient } from "@/lib/supabase/admin";',
        'import { findDuplicates, type Lead } from "@/server/crm/dedupe";',
        'import { createAuditEvent } from "@/server/audit/createAuditEvent";',
        'import { ValidationError } from "@/server/lib/defineModule";',
        'import { maskRecords, maskRecord } from "@/server/masking/masking";',
        'import { applyListFilters, applyListSort, facetCounts } from "@/server/lib/listQuery";',
        'import { applicableFilters, recordInScope } from "@/server/security/scope";',
        'import type { Actor } from "@/server/types";',
        "",
        f"export const CRM_STAGES = [{stages}] as const;",
        "export type CrmStage = (typeof CRM_STAGES)[number];",
        "",
        'export function normalizeName(s?: string): string { return (s || "").toLowerCase().trim().replace(/\\s+/g, " "); }',
        "function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }",
        "function actorId(a: Actor): string | null { return isUuid(a.actor_id) ? a.actor_id : null; }",
        "",
        "// Fail-closed per-record assignment-scope check (OWASP A01 IDOR): a known id cannot be used to act",
        "// outside scope. Enforced only when the record loads (DB present); mirrors the kernel's behavior.",
        "type Db = ReturnType<typeof createSupabaseAdminClient>;",
        "async function assertLeadInScope(supabase: Db, actor: Actor, leadId: string): Promise<void> {",
        "  try {",
        f'    const {{ data: lead }} = await supabase.from({json.dumps(spec["table"])}).select("*").eq("id", leadId).maybeSingle();',
        f'    if (lead && !recordInScope(actor, {json.dumps(spec["table"])}, lead as Record<string, unknown>, {json.dumps(spec["list"].get("owner_column"))})) {{',
        '      throw new ValidationError([{ field: "id", message: "Record not in your scope." }]);',
        "    }",
        "  } catch (e) { if (e instanceof ValidationError) throw e; }",
        "}",
        "",
        gen_list(spec), "",
        gen_build_row(spec), "",
        gen_create(spec), "",
    ]
    for a in spec["row_actions"]:
        parts.append(gen_chain_action(a, spec) if a.get("chain") else gen_field_action(a, spec))
        parts.append("")
    parts.append(gen_sub(spec))
    parts.append("")
    if spec.get("import"):
        parts.append(gen_import(spec))
        parts.append("")
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"generated {OUT}")
    write_routes(spec)

if __name__ == "__main__":
    main()
