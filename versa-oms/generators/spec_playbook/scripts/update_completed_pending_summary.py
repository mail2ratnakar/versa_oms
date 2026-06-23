from __future__ import annotations

import argparse
import json
from pathlib import Path
from common import ROOT, REPORTS_DIR, load_registry, load_state, write_json, write_text, write_csv

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default=str(ROOT / "inputs" / "module_registry.csv"))
    parser.add_argument("--extra-completed", default="")
    parser.add_argument("--out-prefix", default="company_portal_module_generation_status_summary")
    args = parser.parse_args()

    registry = load_registry(Path(args.registry))
    state = load_state()
    completed = set(state.get("completed_modules", []))
    for mid in [x.strip() for x in args.extra_completed.split(",") if x.strip()]:
        completed.add(mid)

    all_ids = [r["module_id"] for r in registry]
    pending = [mid for mid in all_ids if mid not in completed]
    modules = []
    for r in registry:
        modules.append({
            **r,
            "semantic_spec_status": "COMPLETED" if r["module_id"] in completed else "PENDING",
            "next_action": "Generated" if r["module_id"] in completed else "Generate module ZIP with 14-parameter semantic spec."
        })

    summary = {
        "project": "Versa Olympiads",
        "scope": "Company/Internal Portal",
        "module_generation_rule": "Every company portal module must follow the same 14-parameter semantic spec playbook used earlier.",
        "modules_total": len(all_ids),
        "modules_completed": len(completed),
        "modules_pending": len(pending),
        "completed_modules": [mid for mid in all_ids if mid in completed],
        "pending_modules": pending,
        "next_recommended_module": pending[0] if pending else None,
        "modules": modules
    }

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    json_path = REPORTS_DIR / f"{args.out_prefix}.json"
    md_path = REPORTS_DIR / f"{args.out_prefix}.md"
    csv_path = REPORTS_DIR / f"{args.out_prefix}.csv"

    write_json(json_path, summary)
    headers = ["priority_order","module_id","module_name","purpose","semantic_spec_status","next_action"]
    write_csv(csv_path, modules, headers)

    lines = ["# Company Portal Module Generation Status Summary", "", "## Completed"]
    for mid in summary["completed_modules"]:
        lines.append(f"- **{mid}** — COMPLETED")
    lines += ["", "## Pending"]
    for mid in summary["pending_modules"]:
        marker = " — recommended next" if mid == summary["next_recommended_module"] else ""
        lines.append(f"- **{mid}** — PENDING{marker}")
    lines += [
        "",
        "## Totals",
        f"- Total: **{summary['modules_total']}**",
        f"- Completed: **{summary['modules_completed']}**",
        f"- Pending: **{summary['modules_pending']}**",
        "",
        "## Rule",
        "Every company portal module must follow the same **14-parameter semantic spec playbook**."
    ]
    write_text(md_path, "\n".join(lines))

    print(md_path)

if __name__ == "__main__":
    main()
