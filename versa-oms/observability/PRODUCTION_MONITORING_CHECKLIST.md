# PRODUCTION_MONITORING_CHECKLIST.md

## Before Production

- [ ] Logging schema implemented.
- [ ] Redaction implemented.
- [ ] Audit writer health check implemented.
- [ ] API health endpoint implemented.
- [ ] DB health endpoint implemented.
- [ ] Storage health endpoint implemented.
- [ ] Worker health endpoint implemented.
- [ ] Release health endpoint implemented.
- [ ] Metrics emitted for APIs.
- [ ] Metrics emitted for workers.
- [ ] Critical alerts configured.
- [ ] Production smoke monitoring configured.
- [ ] Error monitoring configured.
- [ ] Public verification abuse monitoring configured.
- [ ] Audit hash monitoring configured.
- [ ] DLQ monitoring configured.

## After Production Deploy

- [ ] API errors normal.
- [ ] Login failures normal.
- [ ] Worker queues normal.
- [ ] No critical DLQ.
- [ ] Audit writer healthy.
- [ ] Feature flags correct.
- [ ] Smoke tests passed.
- [ ] No unusual public verification traffic.
