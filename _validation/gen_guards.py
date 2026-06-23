#!/usr/bin/env python3
"""Generate app/server/lib/transitionGuards.ts from each module's workflows.json.

The status->allowed-actions guard map is derived from the workflow transition
edges (transition.from -> transition.to), matched to the implemented service
actions by target status. Actions with no workflow edge (e.g. archive) are allowed
from any status. Only modules with verified journey coverage are emitted (expand
GUARD_MODULES as modules gain e2e tests)."""
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MOD = Path("versa-oms/spec/modules")
SVC = Path("versa-oms/app/server/modules")
OUT = Path("versa-oms/app/server/lib/transitionGuards.ts")
GUARD_MODULES = ["school_onboarding_ops"]  # add a module here once it has a journey e2e

def service_actions(mid):
    f = SVC / mid / "service.ts"
    if not f.exists(): return {}
    return dict(re.findall(r'"(\w+)":\s*\{"target":\s*"(\w+)"', f.read_text(encoding="utf-8")))

def primary_workflow(mid):
    wfs = json.load(open(MOD / mid / "workflows.json", encoding="utf-8"))["workflows"]
    return max(wfs, key=lambda w: len(w.get("transitions", [])))

def build(mid):
    actions = service_actions(mid)                      # action -> target status
    wf = primary_workflow(mid)
    to_from = {}
    for t in wf.get("transitions", []):
        to_from.setdefault(t["to"], set()).update(s for s in t.get("from", []) if s != "none")
    matched = {a: to_from[tgt] for a, tgt in actions.items() if tgt in to_from}
    unmatched = sorted(a for a in actions if a not in matched)
    guard = {}
    for s in wf.get("statuses", []):
        guard[s] = sorted({a for a, froms in matched.items() if s in froms} | set(unmatched))
    return guard

def main():
    guards = {m: build(m) for m in GUARD_MODULES}
    entries = []
    for m, g in guards.items():
        rows = ",\n".join(f"    {json.dumps(s)}: {json.dumps(acts)}" for s, acts in g.items())
        entries.append(f"  {json.dumps(m)}: {{\n{rows}\n  }}")
    body = (
        "// GENERATED from spec/modules/<m>/workflows.json by _validation/gen_guards.py — DO NOT EDIT.\n"
        "// status -> allowed actions (lifecycle edges). To change, edit the workflow spec and re-run.\n\n"
        "export const TRANSITION_GUARDS: Record<string, Record<string, string[]>> = {\n"
        + ",\n".join(entries) + "\n};\n\n"
        "export function isActionAllowedFrom(moduleId: string, status: string | null, action: string): boolean {\n"
        "  const g = TRANSITION_GUARDS[moduleId];\n"
        "  if (!g || !status) return true;\n"
        "  const allowed = g[status];\n"
        "  if (!allowed) return true; // status not declared -> don't block\n"
        "  return allowed.includes(action);\n"
        "}\n"
    )
    OUT.write_text(body, encoding="utf-8")
    print("generated", OUT)
    for m, g in guards.items():
        print(f"  {m}: " + "; ".join(f"{s}->[{','.join(a)}]" for s, a in g.items()))

if __name__ == "__main__":
    main()
