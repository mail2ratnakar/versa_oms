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
    t = json.dumps(spec["table"]); ob = json.dumps(spec["list"]["order_by"])
    return f'''export async function listLeads(actor: Actor, searchParams: URLSearchParams) {{
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const size = Math.min(100, Number.parseInt(searchParams.get("page_size") ?? "50", 10) || 50);
  try {{
    const supabase = createSupabaseAdminClient();
    const {{ data, count }} = await supabase.from({t}).select("*", {{ count: "exact" }}).is("archived_at", null).order({ob}, {{ ascending: false }}).range((page - 1) * size, page * size - 1);
    const items = maskRecords((data ?? []) as Array<Record<string, unknown>>, actor);
    return {{ items, pagination: {{ page, page_size: size, total_count: count ?? items.length, has_next: (count ?? 0) > page * size, next_cursor: null }} }};
  }} catch {{
    return {{ items: [], pagination: {{ page, page_size: size, total_count: 0, has_next: false, next_cursor: null }} }};
  }}
}}'''

def gen_create(spec):
    c = spec["create"]; ctx = {"param": "", "src": "src", "parent": ""}
    req = ", ".join(json.dumps(r) for r in c["required"])
    rowobj = obj(c["row"], ctx)
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

  const now = new Date().toISOString();
  const row: Record<string, unknown> = {rowobj};
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
  try {{
    const supabase = createSupabaseAdminClient();
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
{chr(10).join(body)}
  }} catch (e) {{
    if (e instanceof ValidationError) throw e;
  }}
{chr(10).join(audits)}
  return {ret};
}}'''

def gen_sub(spec):
    s = spec["sub_collection"]; ctx = {"param": "", "src": "src", "parent": "leadId"}
    addrow = obj(s["add_row"], ctx)
    req = s["add_required"][0]
    return f'''export async function {s["list_fn"]}(actor: Actor, leadId: string) {{
  try {{
    const supabase = createSupabaseAdminClient();
    const {{ data }} = await supabase.from({json.dumps(s["table"])}).select("*").eq({json.dumps(s["parent_fk"])}, leadId).order("created_at", {{ ascending: false }});
    return {{ items: maskRecords((data ?? []) as Array<Record<string, unknown>>, actor) }};
  }} catch {{
    return {{ items: [] }};
  }}
}}

export async function {s["add_fn"]}(actor: Actor, leadId: string, payload: {{ channel?: string; note?: string }}) {{
  if (!payload.{req} || !String(payload.{req}).trim()) throw new ValidationError([{{ field: {json.dumps(req)}, message: {json.dumps(req + " is required.")} }}]);
  const now = new Date().toISOString();
  const row = {addrow};
  try {{
    const supabase = createSupabaseAdminClient();
    await supabase.from({json.dumps(s["table"])}).insert(row);
  }} catch {{ /* local */ }}
  {audit_call(s["audit"], ctx, spec["source_module"], s["table"], "leadId")}
  return {{ ...row, applied: true }};
}}'''

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
        'import type { Actor } from "@/server/types";',
        "",
        f"export const CRM_STAGES = [{stages}] as const;",
        "export type CrmStage = (typeof CRM_STAGES)[number];",
        "",
        'export function normalizeName(s?: string): string { return (s || "").toLowerCase().trim().replace(/\\s+/g, " "); }',
        "function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }",
        "function actorId(a: Actor): string | null { return isUuid(a.actor_id) ? a.actor_id : null; }",
        "",
        gen_list(spec), "",
        gen_create(spec), "",
    ]
    for a in spec["row_actions"]:
        parts.append(gen_chain_action(a, spec) if a.get("chain") else gen_field_action(a, spec))
        parts.append("")
    parts.append(gen_sub(spec))
    parts.append("")
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"generated {OUT}")

if __name__ == "__main__":
    main()
