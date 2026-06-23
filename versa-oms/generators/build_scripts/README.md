# Versa Executable Build Scripts Pack

This pack adds the missing executable layer for the spec-driven Versa Olympiads build system.

## Included Scripts

- `scripts/validate_specs.py`
- `scripts/build_from_specs.py`
- `scripts/generate_migrations.py`
- `scripts/generate_routes.js`
- `scripts/generate_tests.js`
- `scripts/check_security_baseline.py`
- `scripts/check_privacy_baseline.py`
- `scripts/generate_rollback.py`
- `scripts/autopilot_build.py`

## Recommended First Commands

```bash
python scripts/validate_specs.py --root .
python scripts/autopilot_build.py --root . --mode plan --module staff_users
python scripts/autopilot_build.py --root . --mode generate --module staff_users
```

## Operating Mode

These scripts are conservative. They generate drafts, stubs, reports and checks. They do not deploy, apply migrations, relax security, or perform production actions.

## Stop Rule

If any security/privacy/spec validation fails, fix the source issue before continuing.
