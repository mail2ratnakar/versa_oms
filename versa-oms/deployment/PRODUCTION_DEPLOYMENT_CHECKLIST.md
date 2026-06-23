# PRODUCTION_DEPLOYMENT_CHECKLIST.md

## Pre-Production

- [ ] CI passed.
- [ ] Type check passed.
- [ ] Tests passed.
- [ ] Security baseline passed.
- [ ] Privacy baseline passed.
- [ ] API contract valid.
- [ ] Schema registry valid.
- [ ] Migration check passed.
- [ ] Rollback file exists.
- [ ] Backup confirmed.
- [ ] Smoke tests ready.
- [ ] Feature flags reviewed.
- [ ] Secrets present.
- [ ] Environment protected.
- [ ] Manual approval recorded.

## Production Deployment

- [ ] Release id created.
- [ ] Commit sha recorded.
- [ ] Production migration applied.
- [ ] App deployed.
- [ ] Health check passed.
- [ ] Production smoke tests passed.
- [ ] No critical logs.
- [ ] Monitoring active.
- [ ] Release locked.

## Post-Deployment

- [ ] 15-minute monitoring complete.
- [ ] 1-hour monitoring complete.
- [ ] Support notified.
- [ ] Release notes saved.
- [ ] Rollback window defined.
