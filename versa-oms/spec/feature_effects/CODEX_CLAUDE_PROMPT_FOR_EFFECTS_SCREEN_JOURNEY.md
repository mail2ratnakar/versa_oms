# Codex / Claude Prompt

```text
Stop broad feature coding.

Read:
- FEATURE_EFFECTS_SCREEN_CONTRACTS_JOURNEY_ACCEPTANCE_SPEC.md
- catalogs/FEATURE_EFFECT_CATALOG.json
- catalogs/SCREEN_CONTRACTS.json
- catalogs/JOURNEY_ACCEPTANCE_TESTS.json
- catalogs/CROSS_MODULE_EFFECT_CHAINS.json
- modules/<module_id>/FEATURE_EFFECTS.md
- modules/<module_id>/SCREEN_CONTRACTS.md
- modules/<module_id>/JOURNEY_ACCEPTANCE_TESTS.md

For each feature:

1. Implement the source screen.
2. Implement the API/service effect.
3. Implement database state changes.
4. Implement downstream task/job/notification/audit effects.
5. Implement UI success/error states.
6. Implement the journey acceptance test.
7. Mark complete only when the journey test passes.

Start with:
school_crm.convert_to_onboarding

Do not improvise screen wiring.
Do not mark module complete from API-only implementation.
```
