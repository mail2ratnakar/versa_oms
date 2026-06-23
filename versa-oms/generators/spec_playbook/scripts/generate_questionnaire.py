from __future__ import annotations

import argparse
from pathlib import Path
from common import ROOT, SOURCE_DIR, ensure_dirs, read_text, write_csv, write_text, load_registry, load_state

QUESTION_GROUPS = [
    ("A", "Scope and Business Purpose", [
        "What business problem should this scope solve?",
        "Which users or staff groups will use this system?",
        "Which outcomes should the system guarantee?",
        "Which items are out of scope for MVP?"
    ]),
    ("B", "Modules and Boundaries", [
        "What modules are needed?",
        "What should each module own?",
        "Which modules should only consume data from others?",
        "Which modules must not directly edit records from other modules?"
    ]),
    ("C", "Data Model", [
        "What are the primary entities?",
        "What fields are mandatory?",
        "What fields are sensitive or restricted?",
        "Which fields are never trusted from the browser?"
    ]),
    ("D", "Workflow and Lifecycle", [
        "What are the lifecycle statuses?",
        "What transitions are allowed?",
        "Which transitions require reason?",
        "Which transitions require approval?"
    ]),
    ("E", "Access and Security", [
        "Which roles can create, read, update, approve, publish, export or archive?",
        "Which records are scoped by assignment, school, region or department?",
        "Which data should be masked by default?",
        "Which operations require dual approval?"
    ]),
    ("F", "Reports, Exports and Audit", [
        "What reports are needed?",
        "Which exports are allowed?",
        "Which exports require approval?",
        "What audit events must be captured?"
    ]),
    ("G", "Validation and Exceptions", [
        "What validations are blocking?",
        "What exceptions can occur?",
        "How should exceptions be resolved?",
        "Which bugs must always get regression tests?"
    ])
]

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", default=str(ROOT / "inputs" / "scope.md"))
    parser.add_argument("--out-csv", default=str(SOURCE_DIR / "questionnaire.csv"))
    parser.add_argument("--out-md", default=str(SOURCE_DIR / "questionnaire.md"))
    args = parser.parse_args()

    ensure_dirs()
    scope = read_text(Path(args.scope)) if Path(args.scope).exists() else ""
    registry = load_registry()
    state = load_state()

    modules = [m["module_id"] for m in registry] or state.get("pending_modules", [])
    rows = []
    qn = 1
    for section_code, section_name, questions in QUESTION_GROUPS:
        for q in questions:
            rows.append({
                "question_id": f"Q{qn:04d}",
                "section": f"{section_code}. {section_name}",
                "question": q,
                "answer": "",
                "answer_source": "tbd",
                "confidence": "tbd",
                "affected_modules": ",".join(modules),
                "data_entities": "",
                "workflow_entities": "",
                "security_implications": "",
                "approval_implications": "",
                "downstream_dependencies": "",
                "assumptions": "",
                "needs_user_review": "true"
            })
            qn += 1

    # Add module-specific questions
    for m in registry:
        mid = m["module_id"]
        name = m["module_name"]
        for q in [
            f"What is the precise business purpose of {name}?",
            f"What entities, fields and statuses must {name} own?",
            f"What workflows and approvals must {name} enforce?",
            f"What access, security and audit rules must {name} enforce?",
            f"What outputs does {name} provide to downstream modules?"
        ]:
            rows.append({
                "question_id": f"Q{qn:04d}",
                "section": f"M. Module Specific — {name}",
                "question": q,
                "answer": "",
                "answer_source": "tbd",
                "confidence": "tbd",
                "affected_modules": mid,
                "data_entities": "",
                "workflow_entities": "",
                "security_implications": "",
                "approval_implications": "",
                "downstream_dependencies": "",
                "assumptions": "",
                "needs_user_review": "true"
            })
            qn += 1

    headers = [
        "question_id", "section", "question", "answer", "answer_source", "confidence",
        "affected_modules", "data_entities", "workflow_entities", "security_implications",
        "approval_implications", "downstream_dependencies", "assumptions", "needs_user_review"
    ]
    write_csv(Path(args.out_csv), rows, headers)

    md = ["# Generated Questionnaire\n", "## Scope\n", scope.strip(), "\n## Questions\n"]
    for r in rows:
        md.append(f"- **{r['question_id']}** [{r['section']}] {r['question']}  \n  Affected modules: `{r['affected_modules']}`")
    write_text(Path(args.out_md), "\n".join(md))

    print(f"Generated questionnaire: {args.out_csv}")
    print(f"Generated markdown: {args.out_md}")

if __name__ == "__main__":
    main()
