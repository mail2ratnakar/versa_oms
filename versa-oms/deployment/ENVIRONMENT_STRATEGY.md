# ENVIRONMENT_STRATEGY.md — Environment Strategy

## 1. Environments

### Development

- local-only.
- mock data.
- no real secrets.
- no real payment/courier/email providers.
- permissive feature flags for development.

### Staging

- production-like.
- masked seed data.
- sandbox providers.
- real migrations.
- real CI/CD checks.
- rollback drills.

### Production

- real users.
- real schools.
- real data.
- protected deploy.
- manual approval.
- conservative feature flags.

## 2. Environment Naming

Use:

- `APP_ENV=development`
- `APP_ENV=staging`
- `APP_ENV=production`

## 3. Data Rules

| Environment | Real data allowed | Real secrets allowed | Auto deploy allowed |
|---|---:|---:|---:|
| Development | No | No | Yes |
| Staging | Masked only | Sandbox only | Yes after CI |
| Production | Yes | Yes | No, approval required |

## 4. Feature Flag Defaults

Production defaults must be conservative:

- live payment gateway: off.
- material release: off until approved.
- result publication: off until approved.
- public certificate verification: off until approved.
- sensitive exports: off until approved.
- bulk notifications: off until approved.

## 5. Environment Separation

Do not share:

- databases.
- storage buckets.
- provider keys.
- signing secrets.
- session secrets.
- webhook secrets.
- export buckets.

## 6. Required Health Checks

Each environment must expose:

- `/api/health`
- database health.
- storage health.
- worker health later.
- audit writer health later.
