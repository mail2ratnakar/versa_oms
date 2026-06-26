# CLAUDE.md — v2 — READ FIRST, EVERY TURN, BEFORE ANY ACTION

This is the operating contract for the **v2 rebuild**. v2 starts from FOUR sources only and DERIVES
everything else. Read this → brain → skills → master process, before you touch anything. (`main` is the
frozen v1 fallback; it is NOT an input to v2.)

## THE CONCEPT (why this exists)
**Centrally standardized, spec-driven, PRODUCTION-GRADE "vibe coding":** the founder states intent
conversationally; the system MATERIALIZES it — correct, complete, traceable — with zero hand-written mess.
The discipline that makes that possible is ONE loop:

> **intent → spec → generate → gate → prove.**

Every fact lives in exactly ONE place and is PROJECTED everywhere by generators. Humans edit sources, never outputs.

## THE FOUR SOURCES (the only hand-authored truth on v2)
1. **brain** — `spec/brain/` — the doctrine: what "complete / production-grade" means; the stop conditions.
2. **skills** — `spec/skills/` — the methodology: how to run each step of the pipeline.
3. **questions** — `generators/spec_playbook/config/questionnaire_schema.json` (+ the question set) — the
   interrogation that, fully answered, completely specifies a system.
4. **responses** — `source-of-truth/` — the founder's answers; THIS system's scope.

If a file is not one of these four and not generated from them, it does not belong on v2.

## THE MASTER PIPELINE (each stage has a generator AND a gate)
`SKILLS → SOURCE OF TRUTH → BUILD CONTROL → ARCHITECTURE → SECURITY/PRIVACY/THREAT → API CONTRACT →`
**`DATA MODEL`** `→ EFFECT CHAINS → SCREEN CONTRACTS → JOURNEY TESTS → FOUNDATION → MODULE CODE → TESTS → CI → STAGING → PROD.`
No stage is done until its gate is green. No feature is complete unless its effect chain, screen contract,
and journey test are complete.

## THE NON-NEGOTIABLES (these are why v1 had to be deleted)
1. **GATES ARE THE SPEC.** The gate is the executable definition of "production-grade"; a stage is done only
   when its gate is green. v1 died because the gates were INCOMPLETE — they passed green on a broken system.
   **Completeness of the gates = correctness of the system.**
2. **QUESTIONS ⇄ GATES ARE DUALS.** For every class of fault there must be a QUESTION that elicits it (so
   intent can't omit it) AND a GATE that enforces it (so generation can't violate it). v1's fatal gap — an
   unkeyed identity spine — had NEITHER. When you find a new fault-class, add BOTH.
3. **DATA-MODEL INTEGRITY IS FIRST-CLASS.** Every entity has a stable IDENTITY KEY. Every relationship is a
   real FOREIGN KEY — never a synthetic string used as a join. No orphan entities. No specced-but-dead tables.
   Every lifecycle chain wired end-to-end. This is the dimension v1 never modeled, and it caused every data
   fault. It is now a question, a generated check, and a gate — at the front of the pipeline.
4. **DERIVE, DON'T AUTHOR.** One source per fact. If a source implies a fact, PROJECT it through a generator —
   never re-type it. Hand-typing a fact that already exists IS the bug.
5. **NO HAND-WRITTEN CODE in the governed surface.** Every file is GENERATED (from a source), FROZEN-KERNEL
   (signed irreducible primitive), or FROZEN-DEBT (signed, deliberate). A new hand-written file fails the census.
6. **EDIT THE SOURCE, THEN REGENERATE.** Never hand-edit generated output.

## THE MOTION
`SOURCE (4 keepers) → DERIVER → specs / canonical / catalog → GENERATOR → code → GATE → PROVE.`
You only ever edit the four sources (or a signed kernel). Never the derived output.

## BEFORE YOU CLAIM DONE
Every relevant gate green · the journey proven (positive + a fail-closed negative) · completed/pending
reported with evidence. Never claim "complete / production-ready" without it. Stop and ask the founder on the
brain's stop conditions, or before relaxing any constraint.
