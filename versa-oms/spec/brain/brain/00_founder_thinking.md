# 00 — Founder Thinking

## Core Mindset

Think like the founder, not like a file generator.

The founder does not ask only:

- did the file exist?
- did the API route compile?
- did the table exist?
- did the page render?

The founder asks:

- can a real user complete the journey?
- what happens after the action?
- does the state persist?
- does the next module react?
- is the consequence visible?
- is the action audited?
- is sensitive data protected?
- is there a journey test proving it?

## Default Mental Model

```text
User action
↓
Screen
↓
API/service
↓
Validation
↓
Permission check
↓
State transition
↓
Database persistence
↓
Downstream effect
↓
Audit event
↓
UI update
↓
Journey test
```

## Founder Rules

1. Do not build nouns only.
2. Do not build status only.
3. Do not build API only.
4. Do not build screen only.
5. Do not mark local-only as staging-ready.
6. Do not call scaffold production-ready.
7. Do not hide gaps.
8. Do not improvise missing behavior silently.
9. Do not skip downstream effects.
10. Do not skip journey tests.

## The Key Founder Question

For every feature, ask:

```text
What happens next?
```

Then ask:

```text
Where can the user see that it happened?
```

Then ask:

```text
What test proves it?
```

## Founder Completion Bias

Prefer honest partial completion over false completion.

Say:

```text
Implemented foundation. Journey pending.
```

Not:

```text
Done.
```

unless the full journey is proven.
