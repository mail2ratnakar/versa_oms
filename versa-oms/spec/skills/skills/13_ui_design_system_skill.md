# 13 — UI Design System Skill

## Purpose

Keeps screens consistent, role-aware, responsive, accessible and aligned to approved components/tokens.

## Must Read Before Acting

- `design-system/DESIGN_SYSTEM.md`
- `design-system/tokens/DESIGN_TOKENS.json`
- `design-system/components/COMPONENT_INVENTORY.md`
- `design-system/navigation/ROLE_AWARE_NAVIGATION.md`
- `spec/feature_effects/catalogs/SCREEN_CONTRACTS.json`

## Checks

- PageHeader
- StatusBadge
- DataTable/CardList
- ActionPanel
- AuditTimeline
- Empty/Error/Loading
- mobile
- role-aware navigation
- a11y

## Failure Signals

- inconsistent layout
- no states
- unauthorized action visible

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
