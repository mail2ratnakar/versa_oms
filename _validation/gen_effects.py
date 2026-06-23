#!/usr/bin/env python3
"""Generate app/server/lib/transitionEffects.ts from spec/effects/chains.json.

Effect chains = cross-module post-conditions the kernel runs AFTER a transition
applies (registered by `module:action`). Human-readable contract:
spec/feature_effects/CROSS_MODULE_EFFECT_CHAINS.md.

Variables in spec values: $now, $source_id (triggering record id), $linked_id
(value of the link column on the source record)."""
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SPEC = Path("versa-oms/spec/effects/chains.json")
OUT = Path("versa-oms/app/server/lib/transitionEffects.ts")
VARS = {"$now": "now", "$source_id": "recordId", "$linked_id": "linkedId"}

def emit_val(v):
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return json.dumps(v)
    if v is None: return "null"
    if isinstance(v, dict):
        return "{ " + ", ".join(f"{json.dumps(k)}: {emit_val(val)}" for k, val in v.items()) + " }"
    if isinstance(v, list):
        return "[" + ", ".join(emit_val(x) for x in v) + "]"
    if isinstance(v, str):
        if v in VARS: return VARS[v]
        if any(k in v for k in VARS):
            s = v
            for k, expr in VARS.items():
                s = s.replace(k, "${" + expr + "}")
            return "`" + s + "`"
        return json.dumps(v, ensure_ascii=False)
    return json.dumps(v)

def fn_name(cid): return "effect_" + re.sub(r"[^A-Za-z0-9]", "_", cid)

def obj(d):
    return "{ " + ", ".join(f"{json.dumps(k)}: {emit_val(v)}" for k, v in d.items()) + " }"

def emit_chain(ch):
    L = [f"async function {fn_name(ch['id'])}(supabase: Db, recordId: string, actor: Actor): Promise<void> {{"]
    L.append("  const now = new Date().toISOString();")
    L.append(f'  const {{ data: src }} = await supabase.from({json.dumps(ch["source_table"])}).select("*").eq("id", recordId).maybeSingle();')
    L.append("  if (!src) return;")
    link = ch.get("link")
    if link:
        L.append("  const row = src as Record<string, unknown>;")
        L.append(f'  const linkedId = row[{json.dumps(link["column"])}] as string | undefined;')
        if link.get("require"):
            L.append("  if (!linkedId) return;")
    for st in ch["steps"]:
        op = st["op"]
        if op == "update":
            target = "linkedId" if st.get("match") == "linked" else "recordId"
            L.append(f'  await supabase.from({json.dumps(st["table"])}).update({obj(st["set"])}).eq("id", {target});')
        elif op == "insert":
            L.append(f'  await supabase.from({json.dumps(st["table"])}).insert({obj(st["values"])});')
        elif op == "audit":
            parts = [
                f'sourceModule: {json.dumps(st["module"])}', f'action: {json.dumps(st["action"])}', "actor",
                f'entityType: {json.dumps(st["entity_type"])}', f'entityId: String({emit_val(st["entity_id"])} ?? "")',
            ]
            if st.get("new_status") is not None: parts.append(f'newStatus: {emit_val(st["new_status"])}')
            if st.get("reason") is not None: parts.append(f'reason: {emit_val(st["reason"])}')
            L.append(f'  await createAuditEvent({{ {", ".join(parts)} }});')
    L.append("}")
    return "\n".join(L)

def main():
    chains = json.load(open(SPEC, encoding="utf-8"))["chains"]
    out = [
        "// GENERATED from spec/effects/chains.json by _validation/gen_effects.py — DO NOT EDIT.",
        "// Human-readable contract: spec/feature_effects/CROSS_MODULE_EFFECT_CHAINS.md",
        '// To change a chain, edit the spec and re-run: python _validation/gen_effects.py',
        'import { createAuditEvent } from "@/server/audit/createAuditEvent";',
        'import type { Actor } from "@/server/types";',
        "",
        'type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;',
        "",
    ]
    for ch in chains:
        out.append(emit_chain(ch)); out.append("")
    reg = ",\n".join(f'  {json.dumps(c["trigger"]["module"] + ":" + c["trigger"]["action"])}: {fn_name(c["id"])}' for c in chains)
    out += [
        "export const TRANSITION_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {",
        reg + ("," if chains else ""),
        "};",
        "",
        "export async function runTransitionEffect(moduleId: string, action: string, supabase: Db, recordId: string, actor: Actor): Promise<void> {",
        "  const fn = TRANSITION_EFFECTS[`${moduleId}:${action}`];",
        "  if (!fn) return;",
        "  try { await fn(supabase, recordId, actor); } catch { /* best-effort: the transition already applied */ }",
        "}",
        "",
    ]
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"generated {OUT} from {len(chains)} chain(s)")

if __name__ == "__main__":
    main()
