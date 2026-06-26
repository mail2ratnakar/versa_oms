#!/usr/bin/env python3
"""Generate transitionGuards.ts + transitionPreconditions.ts from workflows.json.

workflows.json is the SINGLE SOURCE for a module's state machine AND its guards:
  - transition edges (from->to)  -> transitionGuards.ts (status->allowed actions)
  - transition guards[]          -> transitionPreconditions.ts (block before applying),
                                    enforced via spec/guards/guard_checks.json (name->check).
A guard declared in workflows but not in guard_checks is reported as UNMAPPED
(a tracked enforcement gap) — never silently dropped."""
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MOD = Path("versa-oms/spec/modules")
SVC = Path("versa-oms/app/server/modules")
OUT = Path("versa-oms/app/server/lib/transitionGuards.ts")
PRE_OUT = Path("versa-oms/app/server/lib/transitionPreconditions.ts")
GUARD_CHECKS = Path("versa-oms/spec/guards/guard_checks.json")
CANON = Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json")
# GUARD_MODULES is computed in main(): every PRIMARY module whose generated service declares
# transitions (P0.1 — was ["school_onboarding_ops"] only; now app-wide state-machine enforcement).

def service_actions(mid):
    f = SVC / mid / "service.ts"
    if not f.exists(): return {}
    return dict(re.findall(r'"(\w+)":\s*\{"target":\s*"(\w+)"', f.read_text(encoding="utf-8")))

def service_table(mid):
    f = SVC / mid / "service.ts"
    if not f.exists(): return None
    m = re.search(r'table:\s*"(\w+)"', f.read_text(encoding="utf-8"))
    return m.group(1) if m else None

def workflows(mid):
    return json.load(open(MOD / mid / "workflows.json", encoding="utf-8"))["workflows"]

def all_modules():
    return sorted(p.parent.name for p in MOD.glob("*/workflows.json"))

# ---------- transitionGuards (status -> allowed actions) ----------
# Lifecycle is UNIFIED through the rule catalog: the state machine (transitions + legal states) is read from
# the catalog's lifecycle rules. service_actions still comes from the generated service (the API surface).
_CAT = json.loads(Path("versa-oms/reports/rule_catalog.derived.json").read_text(encoding="utf-8"))["rules"]
_LIFECYCLE = [r for r in _CAT if r["type"] == "lifecycle"]
_PRECONDITION = [r for r in _CAT if r["type"] == "precondition"]

def catalog_workflows(mid):
    """{workflow_id: {transitions:[{from,to}], statuses:[...]}} for module mid, from the catalog lifecycle rules.
    id = <module>.<workflow>.<action>.<name>; the legal-states rule carries `statuses`, transitions carry `to`."""
    wfs = {}
    for r in _LIFECYCLE:
        if r["module"] != mid:
            continue
        w = wfs.setdefault(r["id"].split(".")[1], {"transitions": [], "statuses": []})
        if "statuses" in r["then"]:
            w["statuses"] = r["then"]["statuses"]
        elif "to" in r["then"]:
            w["transitions"].append({"from": r["when"].get("from", []), "to": r["then"]["to"]})
    return wfs

def build_guards(mid, wf_mid=None):
    actions = service_actions(mid)
    wfs = catalog_workflows(wf_mid or mid)
    if not wfs:
        return {}
    wf = max(wfs.values(), key=lambda w: len(w["transitions"]))
    to_from = {}
    for t in wf["transitions"]:
        to_from.setdefault(t["to"], set()).update(s for s in t["from"] if s != "none")
    matched = {a: to_from[tgt] for a, tgt in actions.items() if tgt in to_from}
    unmatched = sorted(a for a in actions if a not in matched)
    return {s: sorted({a for a, fr in matched.items() if s in fr} | set(unmatched)) for s in wf["statuses"]}

def emit_guards(guards):
    entries = []
    for m, g in guards.items():
        rows = ",\n".join(f"    {json.dumps(s)}: {json.dumps(a)}" for s, a in g.items())
        entries.append(f"  {json.dumps(m)}: {{\n{rows}\n  }}")
    return (
        "// GENERATED from spec/modules/<m>/workflows.json by _validation/gen_guards.py — DO NOT EDIT.\n"
        "// status -> allowed actions (lifecycle edges). To change, edit the workflow spec and re-run.\n\n"
        "export const TRANSITION_GUARDS: Record<string, Record<string, string[]>> = {\n"
        + ",\n".join(entries) + "\n};\n\n"
        "export function isActionAllowedFrom(moduleId: string, status: string | null, action: string): boolean {\n"
        "  const g = TRANSITION_GUARDS[moduleId];\n"
        "  if (!g || !status) return true;\n"
        "  const allowed = g[status];\n"
        "  if (!allowed) return true;\n"
        "  return allowed.includes(action);\n"
        "}\n"
    )

# ---------- transitionPreconditions (guards[] -> blocking checks) ----------
def app_modules():
    """(moduleId, table) for every generated service — the kernel uses moduleId for preconditions."""
    out = []
    for f in sorted(SVC.glob("*/service.ts")):
        txt = f.read_text(encoding="utf-8")
        mid = re.search(r'moduleId:\s*"(\w+)"', txt)
        tbl = re.search(r'table:\s*"(\w+)"', txt)
        if mid and tbl:
            out.append((mid.group(1), tbl.group(1)))
    return out

def entity_workflows():
    """entity (table) -> all its transitions, indexed across every module's workflows.json.
    A service's workflow may live in another module's spec (e.g. school_slots -> exam_slot_ops)."""
    idx = {}
    for f in MOD.glob("*/workflows.json"):
        for w in json.load(open(f, encoding="utf-8"))["workflows"]:
            idx.setdefault(w.get("entity"), []).extend(w.get("transitions", []))
    return idx

def catalog_entity_transitions():
    """entity (table) -> [{to, guards:[...]}], reconstructed from the catalog (lifecycle 'to' + precondition
    guards, matched by module.workflow.transition), replacing entity_workflows(). Preserves derivation order
    so transitionPreconditions.ts is identical. Precondition is thereby UNIFIED through the catalog."""
    guards_by = {}
    for r in _PRECONDITION:
        p = r["id"].split(".")  # module.workflow.action.<...>
        guards_by.setdefault((p[0], p[1], r["when"]["action"]), []).append(r["when"]["guard"])
    ewf = {}
    for r in _LIFECYCLE:
        if "to" not in r["then"]:
            continue  # the legal-states rule, not a transition
        p = r["id"].split(".")
        ewf.setdefault(r["entity"], []).append({"to": r["then"]["to"], "guards": guards_by.get((p[0], p[1], r["when"]["action"]), [])})
    return ewf


def build_preconditions():
    checks_spec = json.load(open(GUARD_CHECKS, encoding="utf-8"))["checks"]
    canon = json.load(open(CANON, encoding="utf-8")).get("tables", {})
    ewf = catalog_entity_transitions()  # unified: precondition guards (+ lifecycle 'to') from the catalog
    pre, unmapped = {}, {}
    for mid, table in app_modules():
        cols = {c["name"] for c in canon.get(table, {}).get("columns", [])}
        tgt_action = {tgt: a for a, tgt in service_actions(mid).items()}
        for t in ewf.get(table, []):
            action = tgt_action.get(t.get("to"))
            if not action:
                continue
            key = f"{mid}:{action}"
            for g in t.get("guards", []):
                spec = checks_spec.get(g)
                if not spec:
                    unmapped.setdefault(key, [])
                    if g not in unmapped[key]:
                        unmapped[key].append(g)
                    continue
                applicable = (spec["type"] == "linked_status" and spec.get("link_column") in cols) or \
                             (spec["type"] == "self_field_in" and spec.get("column") in cols)
                if not applicable:
                    continue  # mapped check but this entity lacks the column -> not applicable
                bucket = pre.setdefault(key, {"source_table": table, "checks": []})
                if not any(c.get("guard") == g for c in bucket["checks"]):
                    bucket["checks"].append({**spec, "guard": g})
    return pre, unmapped

def emit_precond_fn(key, src, checks):
    name = "precond_" + re.sub(r"[^A-Za-z0-9]", "_", key)
    L = [f"async function {name}(supabase: Db, recordId: string): Promise<void> {{",
         f'  const {{ data: src }} = await supabase.from({json.dumps(src)}).select("*").eq("id", recordId).maybeSingle();',
         "  if (!src) return;", "  const row = src as Record<string, unknown>;"]
    for i, c in enumerate(checks):
        if c["type"] == "linked_status":
            L += [
                f'  const lid{i} = row[{json.dumps(c["link_column"])}] as string | undefined;',
                f'  if (!lid{i}) throw new PreconditionError("Cannot verify {c["target_table"]} status (no {c["link_column"]}); transition blocked.");',
                f'  const {{ data: chk{i}, error: err{i} }} = await supabase.from({json.dumps(c["target_table"])}).select({json.dumps(c["status_column"])}).eq("id", lid{i}).maybeSingle();',
                f'  if (err{i} || !chk{i}) throw new PreconditionError("Could not verify {c["target_table"]} status; transition blocked.");',
                f'  if ((chk{i} as Record<string, unknown>)[{json.dumps(c["status_column"])}] !== {json.dumps(c["equals"])}) throw new PreconditionError({json.dumps(c["error"])});',
            ]
        elif c["type"] == "self_field_in":
            L.append(f'  if (!{json.dumps(c["allowed"])}.includes(String(row[{json.dumps(c["column"])}] ?? ""))) throw new PreconditionError({json.dumps(c["error"])});')
    L.append("}")
    return name, "\n".join(L)

def emit_preconditions(pre):
    fns, reg = [], []
    for key, data in sorted(pre.items()):
        name, fn = emit_precond_fn(key, data["source_table"], data["checks"])
        fns.append(fn); reg.append(f"  {json.dumps(key)}: {name}")
    body = [
        "// GENERATED from spec/modules/<m>/workflows.json guards[] + spec/guards/guard_checks.json by _validation/gen_guards.py — DO NOT EDIT.",
        "// Preconditions run BEFORE a transition applies and BLOCK it (fail-closed) if unmet.",
        "export class PreconditionError extends Error {}",
        "",
        'type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;',
        "",
    ]
    body += fns
    out = "\n".join(body) + ("\n\n" if fns else "\n")
    out += "export const PRECONDITIONS: Record<string, (supabase: Db, recordId: string) => Promise<void>> = {\n"
    out += (",\n".join(reg) + ("," if reg else "")) + "\n};\n\n"
    out += ("export async function runPreconditions(moduleId: string, action: string, supabase: Db, recordId: string): Promise<void> {\n"
            "  const fn = PRECONDITIONS[`${moduleId}:${action}`];\n"
            "  if (fn) await fn(supabase, recordId);\n}\n")
    return out

def main():
    # Every primary module whose generated service declares transitions gets lifecycle-edge guards.
    guard_modules = sorted(m for m in all_modules() if service_actions(m))
    guards = {m: g for m in guard_modules if (g := build_guards(m))}
    # School-portal services share a table+state-machine with a staff spec module (different moduleId,
    # so they don't get guards from all_modules()). Build their guards from the school service's OWN
    # action names against the owning module's workflow, so transitions are from-state gated too
    # (e.g. school_roster:submit only valid from 'validated' — note the school action is 'submit',
    # not the staff 'submit_for_lock', so we can't just copy the owner's map).
    GUARD_ALIASES = {"school_roster": "student_roster_ops"}
    for alias, owner in GUARD_ALIASES.items():
        if alias not in guards and service_actions(alias) and (g := build_guards(alias, owner)):
            guards[alias] = g
    OUT.write_text(emit_guards(guards), encoding="utf-8")
    print(f"guarded modules: {len(guards)}")
    print("generated", OUT)
    pre, unmapped = build_preconditions()
    PRE_OUT.write_text(emit_preconditions(pre), encoding="utf-8")
    print("generated", PRE_OUT)
    for key, data in sorted(pre.items()):
        print(f"  precondition {key}: " + ", ".join(c["guard"] for c in data["checks"]))
    if unmapped:
        print("\nDECLARED-BUT-UNMAPPED guards (workflows.json guards with no enforceable check in guard_checks.json):")
        for key, gs in sorted(unmapped.items()):
            print(f"  {key}: {gs}")

if __name__ == "__main__":
    main()
