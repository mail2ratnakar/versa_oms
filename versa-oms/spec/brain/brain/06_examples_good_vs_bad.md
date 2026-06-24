# 06 — Examples: Good vs Bad

## Example 1 — CRM Lead Conversion

### Bad

```text
Update lead.stage = converted.
Show toast: converted.
```

### Good

```text
Update lead.stage = converted.
Create/link school.
Create onboarding case.
Create onboarding task.
Update onboarding queue.
Update dashboard count.
Write audit event.
Pass CRM → Onboarding journey test.
```

## Example 2 — Manual Payment Confirmation

### Bad

```text
Set invoice.status = paid.
```

### Good

```text
Require finance role.
Require reason/proof.
Require dual approval if threshold applies.
Set payment.status = paid.
Set invoice.status = paid.
Open finance gate.
Allow material readiness only if roster+slot gates pass.
Write audit event.
Notify school.
Pass finance gate journey test.
```

## Example 3 — Material Download

### Bad

```text
Return /downloads/question-paper.pdf
```

### Good

```text
Check school session.
Check own-school scope.
Check release window.
Check finance gate.
Check roster/slot readiness.
Generate short signed URL.
Write download audit.
Never log URL.
Expire/revoke URL.
Pass material download journey test.
```

## Example 4 — Results Publication

### Bad

```text
Set result_batch.status = published.
```

### Good

```text
Require approved score batch.
Require publication approval.
Block self-approval.
Snapshot ranks.
Publish immutable result version.
Notify school.
Create certificate eligibility.
Write audit event.
Pass result publication journey test.
```

## Example 5 — Certificate Reissue

### Bad

```text
Overwrite certificate PDF.
```

### Good

```text
Require approval and reason.
Create new certificate version.
Mark old certificate superseded/revoked.
Update verification response.
Write audit event.
Notify school.
Pass certificate reissue journey test.
```
