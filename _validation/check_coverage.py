#!/usr/bin/env python3
"""Features-pack coverage check — so we never miss/skip anything.

Cross-references the feature-effects pack catalogs (FX / SCR / JRN / CHAIN) against
what is actually specced, generated, and tested. Writes reports/COVERAGE.md and
prints a summary. Run after each build step."""
import json, sys, re
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path("versa-oms")
CAT = ROOT / "spec/feature_effects/catalogs"
SCREENS = ROOT / "spec/screens"
ACTIONS = ROOT / "spec/actions"
EFFECTS = ROOT / "spec/effects/chains.json"
E2E = ROOT / "app/tests/e2e"
OUT = ROOT / "reports/COVERAGE.md"

def cat(name):
    d = json.load(open(CAT / f"{name}.json", encoding="utf-8"))
    return d if isinstance(d, list) else next((v for v in d.values() if isinstance(v, list)), [])

def main():
    fx, scr, jrn, chains = cat("FEATURE_EFFECT_CATALOG"), cat("SCREEN_CONTRACTS"), cat("JOURNEY_ACCEPTANCE_TESTS"), cat("CROSS_MODULE_EFFECT_CHAINS")
    modules = sorted({r.get("module_id") for r in scr + jrn + fx if r.get("module_id")})

    screen_specs = {p.name.replace(".screen.json", "") for p in SCREENS.glob("*.screen.json")}
    action_specs = {p.name.replace(".actions.json", "") for p in ACTIONS.glob("*.actions.json")}
    effect_ids = {c["id"] for c in json.load(open(EFFECTS, encoding="utf-8")).get("chains", [])} if EFFECTS.exists() else set()
    e2e_text = "\n".join(p.read_text(encoding="utf-8") for p in E2E.glob("*.spec.ts")) if E2E.exists() else ""

    def count(rows, m): return sum(1 for r in rows if r.get("module_id") == m)

    lines = ["# Features-Pack Coverage", "", f"Pack: {len(fx)} FX · {len(scr)} SCR · {len(jrn)} JRN · {len(chains)} CHAIN", "",
             "## Per module", "", "| Module | FX | SCR | JRN | screen-spec | action-spec |", "|---|--:|--:|--:|:--:|:--:|"]
    n_screen = n_action = 0
    for m in modules:
        s = "✅" if m in screen_specs else "—"; a = "✅" if m in action_specs else "—"
        n_screen += m in screen_specs; n_action += m in action_specs
        lines.append(f"| {m} | {count(fx, m)} | {count(scr, m)} | {count(jrn, m)} | {s} | {a} |")

    lines += ["", "## Cross-module chains", "", "| Chain | Trigger | in effects-spec | has e2e |", "|---|---|:--:|:--:|"]
    n_chain_spec = n_chain_e2e = 0
    for c in chains:
        cid = c["chain_id"]
        in_spec = cid in effect_ids
        has_e2e = bool(re.search(re.escape(cid), e2e_text))
        n_chain_spec += in_spec; n_chain_e2e += has_e2e
        lines.append(f"| {cid} | {str(c.get('trigger',''))[:48]} | {'✅' if in_spec else '—'} | {'✅' if has_e2e else '—'} |")

    summary = (f"modules={len(modules)} screen-specs={n_screen} action-specs={n_action} | "
               f"chains: in-spec={n_chain_spec}/{len(chains)} e2e={n_chain_e2e}/{len(chains)}")
    lines += ["", "## Summary", "", summary, ""]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(summary)
    print(f"wrote {OUT}")

if __name__ == "__main__":
    main()
