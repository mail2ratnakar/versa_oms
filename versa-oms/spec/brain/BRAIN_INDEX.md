# Founder Brain Index

00. [Founder Thinking](brain/00_founder_thinking.md) — Teaches Claude the founder’s default product-thinking pattern: complete means consequence, visibility, persistence and proof.
01. [Product Philosophy](brain/01_product_philosophy.md) — Defines product principles: user journeys, operational truth, visible consequences, no toy demos, no hidden gaps.
02. [Quality Bar](brain/02_quality_bar.md) — Defines what good enough means for specs, screens, APIs, data, audit, security, journeys and deployment.
03. [Gap Detection Heuristics](brain/03_gap_detection_heuristics.md) — Gives Claude founder-like heuristics to spot API-only, screen-only, table-only, status-only, local-only and missing-effect gaps.
04. [Bug Fix Method](brain/04_bug_fix_method.md) — Turns bug fixing into feature/journey/effect diagnosis instead of one-line patching.
05. [Feature Completion Definition](brain/05_feature_completion_definition.md) — Defines when a feature/module can be marked complete.
06. [Examples: Good vs Bad](brain/06_examples_good_vs_bad.md) — Concrete examples of shallow build vs complete build.
07. [Project Memory](brain/07_project_memory.md) — Reusable living memory for mismatches, founder corrections and future rules.
08. [Decision Patterns](brain/08_decision_patterns.md) — Reusable patterns for deciding what to build, fix, stop, ask or verify.
09. [When To Stop And Ask](brain/09_when_to_stop_and_ask.md) — Defines stop conditions and when Claude must not improvise.
10. [Self Review Questions](brain/10_self_review_questions.md) — Questions Claude must ask before claiming completion.
11. [Brain + Skills + Packs Operating Model](brain/11_operating_model.md) — Defines how brain, skills, packs and code work together.

## Repo mapping (our nomenclature)

This pack's generic concepts map to our real files:

- **brain / skills** → `spec/brain/` and `spec/skills/` (the skills dictionary).
- **packs (source of truth)** → `spec/modules/<m>/*`, `implementation/CANONICAL_DATA_MODEL.json`, `spec/feature_effects/catalogs/*`, `build/BUSINESS_FEATURE_IMPLEMENTATION_MANIFEST.json`.
- **the canonical loop** → `spec/BUILD_PROCESS.md`; the principles dictionary → `spec/PRINCIPLES.md`; per-element data checks → `spec/WORKFLOW_CHECKLIST.md`.
- **completed/pending summary** → `reports/BUILD_STATUS.md` (+ `reports/NEXT_SESSION.md`).
- **effect / screen / journey contracts** → `spec/feature_effects/catalogs/{CROSS_MODULE_EFFECT_CHAINS,FEATURE_EFFECT_CATALOG,SCREEN_CONTRACTS,JOURNEY_ACCEPTANCE_TESTS}.json`.
- **living / project memory** → the persistent memory at `.claude/projects/.../memory/` (`MEMORY.md` index) — append founder corrections there using `spec/brain/MEMORY_UPDATE_TEMPLATE.md`. `brain/07_project_memory.md` holds the seed corrections.
- **tests / journey tests** → `versa-oms/app/tests/` catalogued in `spec/TEST_REGISTRY.md` (P4.7).
- **readiness labels** (spec-complete … production-ready) are the project's official completion vocabulary — use them, don't claim "complete/production-ready" without evidence (P0.7 / Quality Bar).
