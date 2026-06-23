# Behavior Spec (Effects + Screen + Journey) — Source-of-Truth rows 1–10
Status: **FROZEN 2026-06-23**. Adds the 3 missing layers to each scope row:
Effect (post-conditions) · Screen contract (what the user sees/does) · Journey acceptance (e2e assertion).

## FROZEN DECISIONS
- **Q1 Brand:** **"Versa Olympiads"** everywhere (sidebar brand, page title, home, login). "Versa Operations Console" stays as the staff subtitle.
- **Q3 Isolation:** ENFORCE staff↔school↔public isolation + add e2e (public-minimal testable now; full staff/school cross-test runs once real auth/sessions exist).
- **Q7 Sensitive reads:** AUDIT sensitive reads now — opening a single student/PII record, answer keys, exports → `read` audit event.
- **Q8 Scope:** FULL assignment scope now — school + region + olympiad + queue; non-admin staff filtered on every dimension the table supports; Assign-scope UI in Staff Users.

Legend: ✅ already built · 🔶 partly built · 🆕 to build.

---

### Q1 — Official portal name / namespace  [MVP]
SoT: "Versa Company Portal" business name; namespace `company_portal`.
- **Effect:** brand label resolved from one config constant; namespace `company_portal` used in routes/specs.
- **Screen:** sidebar brand + page `<title>` + login show the brand. (Today shows "OlympiadOS" — mismatch.)
- **Journey (e2e):** GET `/staff/dashboard` → header text == agreed brand.
- **Proposed:** Pick ONE brand and use it everywhere. Recommend keeping **"OlympiadOS"** as the product brand with **"Versa Operations Console"** as the staff-portal subtitle (already in the sidebar). 🔶

### Q2 — Internal-staff-only MVP; vendors later  [MVP+]
SoT: staff-only MVP; vendor/evaluator restricted access later.
- **Effect:** only actor types `staff | school | public`; vendors exist as records, not logins.
- **Screen:** no vendor login/portal; (future) restricted vendor views behind a flag.
- **Journey:** a non-staff/non-school identity has no console; vendor records visible only inside staff modules.
- **Proposed:** Freeze actor types to staff/school/public for MVP; reserve `vendor` role string, no UI. ✅

### Q3 — One app, route groups `/staff /school /verify`  [MVP]
SoT: one app, separate route groups + permissions, no mixed layouts.
- **Effect:** 3 layouts + guards; a staff session cannot read school-scoped rows except via staff modules; a school session is hard-bound to its `school_id`; `/verify` is public + minimal.
- **Screen:** distinct shells — staff console, school portal, public verify.
- **Journey:** (a) school session GET `/api/staff/*` → 401/403; (b) staff session GET `/school/*` data → only via scoped staff endpoints; (c) `/verify` returns whitelisted fields only.
- **Proposed:** Add an **e2e cross-portal isolation test** (currently route groups exist but isolation isn't asserted). 🔶→🆕(test)

### Q4 — Staff login: admin-invite, email/magic-link  [MVP] (AUTH — deferred)
SoT: admin-created invite-only; email login/magic-link MVP; Google SSO + OTP later.
- **Effect:** admin invites staff → **hashed, expiring** invite token emailed → staff sets credential / clicks magic link → session cookie (httpOnly, secure); session revocable.
- **Screen:** `/login`, `/invite/accept?token=…`, and an "Invite staff" action in Staff Users.
- **Journey:** invite → email link → accept → authenticated session; expired/used token → rejected; no credential → no access.
- **Proposed:** Spec now, **build last** (as agreed). Use Supabase Auth (magic link + password); invite tokens hashed (sha256) + 72h expiry; session revocation via Supabase. 🆕(deferred)

### Q5 — Invite-only access  [MVP] (AUTH)
SoT: invite-only only.
- **Effect:** account creation only through an admin-issued invite; `staff_invitations` row consumed on accept.
- **Screen:** no public signup; Staff Users → "Invite" issues a token row.
- **Journey:** only an email with a valid unconsumed invite can create a session.
- **Proposed:** Build with Q4. 🆕(deferred)

### Q6 — No staff self-registration  [MVP] (AUTH)
SoT: self-registration disabled.
- **Effect:** no signup route exists; registration endpoints absent.
- **Screen:** no "Sign up" anywhere.
- **Journey:** GET `/signup` → 404; only admin-invite path onboards staff.
- **Proposed:** Build with Q4. 🆕(deferred)

### Q7 — Audit all staff actions (writes + sensitive reads)  [MVP]
SoT: audit all create/update/status/approval/export/login + sensitive reads.
- **Effect:** every write/transition/export → append-only, hash-chained `audit_events`; **sensitive reads** (student PII, answer keys, exports, raw OMR) also audited.
- **Screen:** Security & Audit console — filterable audit log (actor/action/entity/date/risk); per-record "audit trail".
- **Journey:** create → an `audit_events` row with actor/action/entity/hash; UPDATE/DELETE on it → DB-blocked; opening a student PII record → a `read` audit row.
- **Proposed:** Writes/transitions/exports = ✅ (done, verified). **Add sensitive-READ audit** (students/answer-keys/exports) — recommend YES now (cheap, high compliance value). 🔶→🆕(read-audit)

### Q8 — Role + department + assignment-scope model  [MVP]
SoT: access restricted by role, department, assignment scope (school/region/olympiad/queue).
- **Effect:** non-admin staff lists/data filtered by their assignment scope; admin/global sees all.
- **Screen:** Staff Users shows role + department + scope; an **Assign scope** control; lists respect scope; dashboard scoped.
- **Journey:** a scoped ops-exec sees only assigned schools' rows; an admin sees all; browser-set scope ignored.
- **Proposed:** School-scope filter = 🔶 (built for school_id tables). **MVP = school-assignment scope only**; region/olympiad/queue scopes later. Add the Assign-scope UI + e2e. 🔶→🆕(UI+test)

### Q9 — Single-company MVP, future namespace  [MVP+]
SoT: one company; optional `company_id`/`organization_id` where cheap.
- **Effect:** single implicit tenant; no company switcher; schema reserves optional org id.
- **Screen:** none (no tenant UI).
- **Journey:** all data resolves under one company without an org selector.
- **Proposed:** Freeze single-tenant; no org_id columns for MVP (add later only if multi-tenant is funded). ✅

### Q10 — Modular MVP scope (19 modules)  [MVP]
SoT: build as modular internal ops system, not a monolith.
- **Effect:** 19 modules each = own tables + routes + nav + (now) effects + screen.
- **Screen:** sidebar lists all 19 (+ Core data group); each route loads.
- **Journey:** every module route returns 200 and renders its screen.
- **Proposed:** Structure ✅. The **effects+screen+e2e loop** (this exercise) is what upgrades each from "loads" to "complete". 🔶
