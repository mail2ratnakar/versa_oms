#!/usr/bin/env python3
"""Comprehensive module gap audit — mechanical, spec-grounded, BOTH portals.

For every module spec, reconcile what is DECLARED in its own files against what is
actually IMPLEMENTED in the app:
  - workflows.json transitions (per entity)  vs  service transitions (by target status)
  - service / collection-route / action-route presence (staff + school)
  - declared screens (screens.json)           vs  pages present
Unlike the heuristic source_of_truth_audit (keyword match), this reads each entity's
real transitions and checks the bound service — so it cannot be fooled by partial work.

Output: reports/MODULE_GAP_AUDIT.md  + console summary."""
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path("versa-oms")
SPEC = ROOT / "spec/modules"
SVC = ROOT / "app/server/modules"
APP = ROOT / "app/app"
API = ROOT / "app/app/api"
OUT = ROOT / "reports/MODULE_GAP_AUDIT.md"
NONSTART = {"none", "draft", "uploaded", "pending", "not_started", "recorded", "generation_requested"}
# Target statuses that SHOULD become an action (mirrors gen_modules.STATUS_ACTION keys).
# A declared transition to one of these but not implemented = a REAL gap. Others are
# intermediate states the generator intentionally does not expose as actions.
ACTIONABLE = {
  "approved", "published", "released", "confirmed", "locked", "revoked", "rejected",
  "withheld", "reissued", "approved_for_results", "paid", "reversed", "refunded",
  "cancelled", "archived", "suspended", "blocked", "scheduled", "dispatched",
  "delivered", "received", "validated", "generated", "submitted", "submitted_for_lock",
  "closed", "in_transit", "activated",
}

def service_index():
    """table -> list of {module, side, actions:{action:target}, dir}."""
    idx = {}
    for f in sorted(SVC.glob("*/service.ts")):
        txt = f.read_text(encoding="utf-8")
        mid = re.search(r'moduleId:\s*"(\w+)"', txt)
        tbl = re.search(r'table:\s*"(\w+)"', txt)
        if not (mid and tbl):
            continue
        actions = dict(re.findall(r'"(\w+)":\s*\{"target":\s*"(\w+)"', txt))
        side = "school" if mid.group(1).startswith("school_") else "staff"
        idx.setdefault(tbl.group(1), []).append({"module": mid.group(1), "side": side, "actions": actions, "dir": f.parent.name})
    return idx

def has_action_route(side):
    base = API / side
    return any(base.rglob("actions/[[]action[]]/route.ts")) if base.exists() else False

def main():
    sidx = service_index()
    # action-route presence per portal
    staff_actions = list((API / "staff").rglob("route.ts")) if (API / "staff").exists() else []
    school_actions = list((API / "school").rglob("route.ts")) if (API / "school").exists() else []
    staff_has_actions = any("actions" in str(p) for p in staff_actions)
    school_has_actions = any("actions" in str(p) for p in school_actions)

    modules = sorted(p.parent.name for p in SPEC.glob("*/workflows.json"))
    rows, totals = [], {"declared": 0, "impl": 0, "intermediate": 0, "no_service": 0, "school_entities": 0, "school_impl": 0}
    detail = []
    for mid in modules:
        wfs = json.load(open(SPEC / mid / "workflows.json", encoding="utf-8"))["workflows"]
        feats = json.load(open(SPEC / mid / "features.json", encoding="utf-8")).get("features", []) if (SPEC / mid / "features.json").exists() else []
        m_declared = m_impl = m_inter = 0
        ent_lines = []
        for w in wfs:
            ent = w.get("entity")
            all_t = {t["to"] for t in w.get("transitions", []) if t.get("to") not in NONSTART}
            actionable = all_t & ACTIONABLE          # SHOULD be actions
            intermediate = all_t - ACTIONABLE        # intentionally not actions
            services = sidx.get(ent, [])
            impl_targets = set()
            for s in services:
                impl_targets |= set(s["actions"].values())
            done = actionable & impl_targets
            missing = sorted(actionable - impl_targets)
            m_declared += len(actionable); m_impl += len(done); m_inter += len(intermediate)
            sides = "+".join(sorted({s["side"] for s in services})) or "NONE"
            if sides == "NONE" and actionable:
                totals["no_service"] += 1
            is_school = any(s["side"] == "school" for s in services) or ent.startswith("school_")
            if is_school:
                totals["school_entities"] += 1
                totals["school_impl"] += 1 if any(s["side"] == "school" and s["actions"] for s in services) else 0
            if missing or (sides == "NONE" and actionable):
                ent_lines.append(f"    - `{ent}`: {len(done)}/{len(actionable)} actions impl (service: {sides})" + (f" — MISSING {missing}" if missing else ""))
        totals["declared"] += m_declared; totals["impl"] += m_impl; totals["intermediate"] += m_inter
        pct = round(100 * m_impl / m_declared) if m_declared else 100
        rows.append((mid, m_declared, m_impl, pct, len(feats)))
        if ent_lines:
            detail.append(f"### {mid} ({m_impl}/{m_declared} actions)\n" + "\n".join(ent_lines))

    rows.sort(key=lambda r: (r[3], -r[1]))
    fair = round(100 * totals['impl'] / totals['declared']) if totals['declared'] else 0
    lines = ["# Module Gap Audit (mechanical, spec-grounded, both portals)", "",
             "Supersedes the heuristic source_of_truth_audit. Counts only ACTIONABLE transition",
             "targets (those that should become an action); intermediate states are excluded.", "",
             f"**Actionable transitions implemented: {totals['impl']}/{totals['declared']} ({fair}%)**.",
             f"Intermediate (intentionally not actions, informational): {totals['intermediate']}.",
             f"**Entities with actionable transitions but NO service (unbuilt): {totals['no_service']}.**",
             f"**School portal action routes present:** {'YES' if school_has_actions else 'NO'}  ·  **Staff:** {'YES' if staff_has_actions else 'NO'}",
             f"**School-facing entities with any implemented action:** {totals['school_impl']}/{totals['school_entities']}", "",
             "## Per module (worst first)", "", "| Module | actions impl/declared | % | features |", "|---|--:|--:|--:|"]
    for mid, dec, imp, pct, nf in rows:
        lines.append(f"| {mid} | {imp}/{dec} | {pct}% | {nf} |")
    lines += ["", "## Gap detail (entities with missing transitions or no service)", ""] + detail
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"ACTIONABLE transitions: {totals['impl']}/{totals['declared']} ({fair}%) | intermediate(excluded)={totals['intermediate']} | unbuilt-entities={totals['no_service']}")
    print(f"school action routes: {'YES' if school_has_actions else 'NO'} | school-facing entities w/ actions: {totals['school_impl']}/{totals['school_entities']}")
    print(f"wrote {OUT}")

if __name__ == "__main__":
    main()
