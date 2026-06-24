# 07 — Project Memory

This is living memory. Add every founder correction here.

## Memory 001 — CRM to Onboarding Miss

### Observed

Lead conversion changed CRM state but did not fully create onboarding consequences.

### Founder Thinking

A converted lead is not complete until:

- school record is created or linked.
- onboarding case is created.
- onboarding task is assigned.
- onboarding queue updates.
- dashboard count updates.
- audit event is written.
- journey test proves it.

### Rule

Every status transition must trigger its downstream effect chain.

### Future Check

Before implementing any status transition, inspect:

- `spec/feature_effects/catalogs/CROSS_MODULE_EFFECT_CHAINS.json`
- `spec/feature_effects/catalogs/FEATURE_EFFECT_CATALOG.json`
- module journey tests.

## Memory 002 — Infrastructure vs Build Claim

### Observed

Local functional scaffold was strong but not production-ready.

### Founder Thinking

Local working code is not staging-ready if real DB, auth, storage, CI, observability and security hardening are missing.

### Rule

Use accurate readiness labels:

- scaffold-complete.
- local-functional.
- staging-candidate.
- staging-ready.
- production-ready.

### Future Check

Before claiming readiness, apply Completion Verification Skill and CI Deployment Skill.

## Memory 003 — Specs Need Effects and Screens

### Observed

Earlier specs had nouns, states and APIs but lacked effects, screen contracts and journey acceptance.

### Founder Thinking

A spec is incomplete if it does not say what happens after the user action and where the user sees the result.

### Rule

Every feature needs:

- effect chain.
- screen contract.
- journey test.

### Future Check

Before coding any module, read the feature effects + screen contracts + journey acceptance pack.

## Template For New Memory

### Observed

What happened?

### Founder Thinking

How should this be understood?

### Rule

What rule must Claude follow next time?

### Future Check

Which files/checks should Claude inspect before acting?
