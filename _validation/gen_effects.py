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

def emit_val(v, extra=None):
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return json.dumps(v)
    if v is None: return "null"
    if isinstance(v, dict):
        return "{ " + ", ".join(f"{json.dumps(k)}: {emit_val(val)}" for k, val in v.items()) + " }"
    if isinstance(v, list):
        return "[" + ", ".join(emit_val(x) for x in v) + "]"
    if isinstance(v, str):
        if v.startswith("const:"): return json.dumps(v[6:])
        vars = {**VARS, **(extra or {})}
        if v in vars: return vars[v]
        if any(k in v for k in vars):
            s = v
            for k, expr in vars.items():
                s = s.replace(k, "${" + expr + "}")
            return "`" + s + "`"
        return json.dumps(v, ensure_ascii=False)
    return json.dumps(v)

def fn_name(cid): return "effect_" + re.sub(r"[^A-Za-z0-9]", "_", cid)

def obj(d, extra=None):
    return "{ " + ", ".join(f"{json.dumps(k)}: {emit_val(v, extra)}" for k, v in d.items()) + " }"

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
    # lookups: fetch a column from a related table into a var
    lookvars = {f'${lk["as"]}': lk["as"] for lk in ch.get("lookups", [])}
    for lk in ch.get("lookups", []):
        on = emit_val(lk["on"])
        L.append(f'  const {{ data: lk_{lk["as"]} }} = await supabase.from({json.dumps(lk["from_table"])}).select({json.dumps(lk["select"])}).eq("id", {on}).maybeSingle();')
        L.append(f'  const {lk["as"]} = ((lk_{lk["as"]} as Record<string, unknown> | null)?.[{json.dumps(lk["select"])}] as string) ?? {json.dumps(lk.get("default", ""))};')
    # foreach: iterate matching child rows, assign fields (+ sequential candidate id) + write an event row
    fe = ch.get("foreach")
    if fe:
        feextra = {**lookvars, "$row_id": "k.id", "$cid": "cid", "actor_uuid": "actorUuid(actor)"}
        q = f'supabase.from({json.dumps(fe["table"])}).select("id")'
        for col, val in fe["where"].items():
            q += (f'.is({json.dumps(col)}, null)' if val is None else f'.eq({json.dumps(col)}, {emit_val(val, lookvars)})')
        L.append('  const { makeCandidateId } = await import("@/server/eval/candidateId");')
        L.append(f'  const {{ data: kids }} = await {q};')
        L.append('  let seq = 0;')
        L.append('  for (const k of (kids ?? []) as Array<{ id: string }>) {')
        L.append('    seq++;')
        L.append(f'    const cid = makeCandidateId(String({emit_val(fe["id_prefix"], lookvars)}), seq);')
        L.append(f'    await supabase.from({json.dumps(fe["table"])}).update({obj(fe["assign"], feextra)}).eq("id", k.id);')
        if fe.get("event"):
            L.append(f'    await supabase.from({json.dumps(fe["event"]["table"])}).insert({obj(fe["event"]["values"], feextra)});')
        L.append('  }')
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

PRE_OUT = OUT.parent / "transitionPreconditions.ts" if hasattr(OUT, "parent") else None

def pc_name(pc): return "precond_" + re.sub(r"[^A-Za-z0-9]", "_", pc["trigger"]["module"] + "_" + pc["trigger"]["action"])

def emit_precondition(pc):
    L = [f"async function {pc_name(pc)}(supabase: Db, recordId: string): Promise<void> {{"]
    L.append(f'  const {{ data: src }} = await supabase.from({json.dumps(pc["source_table"])}).select("*").eq("id", recordId).maybeSingle();')
    L.append("  if (!src) return;")
    L.append("  const row = src as Record<string, unknown>;")
    for i, chk in enumerate(pc["checks"]):
        if chk["type"] == "linked_status":
            # Fail CLOSED: missing link, query error, or missing target row all block the transition.
            L.append(f'  const lid{i} = row[{json.dumps(chk["link_column"])}] as string | undefined;')
            L.append(f'  if (!lid{i}) throw new PreconditionError("Cannot verify {chk["target_table"]} status (no {chk["link_column"]}); transition blocked.");')
            L.append(f'  const {{ data: chk{i}, error: err{i} }} = await supabase.from({json.dumps(chk["target_table"])}).select({json.dumps(chk["status_column"])}).eq("id", lid{i}).maybeSingle();')
            L.append(f'  if (err{i} || !chk{i}) throw new PreconditionError("Could not verify {chk["target_table"]} status; transition blocked.");')
            L.append(f'  if ((chk{i} as Record<string, unknown>)[{json.dumps(chk["status_column"])}] !== {json.dumps(chk["equals"])}) throw new PreconditionError({json.dumps(chk["error"])});')
    L.append("}")
    return "\n".join(L)

def gen_preconditions(spec):
    pcs = spec.get("preconditions", [])
    out = [
        "// GENERATED from spec/effects/chains.json (preconditions) by _validation/gen_effects.py — DO NOT EDIT.",
        "// Preconditions run BEFORE a transition applies and BLOCK it if unmet (PreconditionError).",
        "export class PreconditionError extends Error {}",
        "",
        'type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;',
        "",
    ]
    for pc in pcs:
        out.append(emit_precondition(pc)); out.append("")
    reg = ",\n".join(f'  {json.dumps(p["trigger"]["module"] + ":" + p["trigger"]["action"])}: {pc_name(p)}' for p in pcs)
    out += [
        "export const PRECONDITIONS: Record<string, (supabase: Db, recordId: string) => Promise<void>> = {",
        reg + ("," if pcs else ""),
        "};",
        "",
        "export async function runPreconditions(moduleId: string, action: string, supabase: Db, recordId: string): Promise<void> {",
        "  const fn = PRECONDITIONS[`${moduleId}:${action}`];",
        "  if (fn) await fn(supabase, recordId);",
        "}",
        "",
    ]
    return "\n".join(out)

def main():
    spec = json.load(open(SPEC, encoding="utf-8"))
    chains = spec["chains"]
    out = [
        "// GENERATED from spec/effects/chains.json by _validation/gen_effects.py — DO NOT EDIT.",
        "// Human-readable contract: spec/feature_effects/CROSS_MODULE_EFFECT_CHAINS.md",
        '// To change a chain, edit the spec and re-run: python _validation/gen_effects.py',
        'import { createAuditEvent } from "@/server/audit/createAuditEvent";',
        'import type { Actor } from "@/server/types";',
        "",
        'type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;',
        "function actorUuid(a: Actor): string | null { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.actor_id) ? a.actor_id : null; }",
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
    (OUT.parent / "transitionPreconditions.ts").write_text(gen_preconditions(spec), encoding="utf-8")
    print(f"generated transitionPreconditions.ts from {len(spec.get('preconditions', []))} precondition(s)")

if __name__ == "__main__":
    main()
