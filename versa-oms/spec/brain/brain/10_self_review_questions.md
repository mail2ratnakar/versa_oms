# 10 — Self Review Questions

Before claiming completion, answer:

## Product

1. What user journey did I complete?
2. What user action starts it?
3. Which screen owns it?
4. What downstream effect happens?
5. Where does the user see the result?

## Technical

6. Which API route is called?
7. Which service function executes?
8. Which records are created?
9. Which records are updated?
10. Which status changes?

## Security

11. Was auth checked?
12. Was role/scope checked server-side?
13. Were browser-trusted fields ignored?
14. Were sensitive fields masked?
15. Was a high-risk approval needed?

## Audit / Reliability

16. Was audit written?
17. Was idempotency enforced?
18. Was the worker/job path needed?
19. Was retry/DLQ needed?
20. Were logs privacy-safe?

## Testing

21. Is there a journey test?
22. Does it verify DB persistence?
23. Does it verify downstream effect?
24. Does it verify audit?
25. Does it verify unauthorized access blocked?

## Readiness

26. Is this local-only?
27. Is real DB wired?
28. Is real auth wired?
29. Is real storage wired?
30. Did CI pass?

## Final Label

Choose exactly one:

- spec-complete.
- scaffold-complete.
- local-functional.
- staging-candidate.
- staging-ready.
- production-candidate.
- production-ready.
