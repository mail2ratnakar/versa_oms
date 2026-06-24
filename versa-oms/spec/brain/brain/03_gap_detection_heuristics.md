# 03 — Gap Detection Heuristics

## Founder Gap Heuristics

When reviewing any feature, ask:

### Noun-only gap

```text
Did we define only the table/entity?
```

If yes, missing behavior.

### Status-only gap

```text
Did we define only statuses but not consequences?
```

If yes, missing effect chain.

### API-only gap

```text
Does the route exist but no screen uses it?
```

If yes, missing screen contract.

### Screen-only gap

```text
Does the button exist but no persisted state changes?
```

If yes, missing service/DB effect.

### Local-only gap

```text
Does it work only with memory/demo headers/mock data?
```

If yes, not staging-ready.

### Journey gap

```text
Can a real actor complete the journey from UI to DB to downstream effect?
```

If no, feature incomplete.

### Audit gap

```text
Did a write/high-risk action happen without audit?
```

If yes, unacceptable.

### Security gap

```text
Can a user see another school, raw file path, provider payload, answer key, raw OMR, or unmasked PII?
```

If yes, critical.

## Gap Report Format

When a gap is found, report:

```text
GAP:
WHY IT MATTERS:
AFFECTED FEATURE:
AFFECTED SCREEN:
AFFECTED API:
AFFECTED EFFECT CHAIN:
MISSING TEST:
FIX:
RISK:
```

## Do Not Hide Gaps

Never bury gaps inside optimistic status.

Say plainly:

```text
The UI exists, but the downstream onboarding case is not created.
```

not:

```text
CRM mostly complete.
```
