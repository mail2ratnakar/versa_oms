# Claude Code / Codex Start Prompt

```text
You are implementing this project from specs and skills.

Do not code yet.

First read:
- SKILLS_INDEX.md
- all files in /skills in numeric order

Then read the project packs:
- build control
- source of truth
- module specs
- ADRs
- threat model
- API contract
- design system
- seed data
- worker queue
- observability
- feature effects / screen contracts / journey acceptance pack
- completed/pending summary

Then identify the next pending item.

Implement only the next pending item.

For each change:
- apply the relevant skills
- follow the specs
- implement effect chain
- implement screen contract
- implement journey test
- run tests
- update completed/pending summary

Do not call local-only, scaffold-only or API-only work complete.
Stop and report gaps if required infra, security, screen, effect or journey proof is missing.
```
