# Versa Sandbox — Security & Privacy (source-driven, gated)

**Principle: security is not a layer bolted on — it is the WHO column of the 5W1H, declared in source and *enforced by gates*.** The research is blunt that this is where every vibe-coding tool dies (Lovable CVE: RLS off across 303 endpoints; 45% of AI code fails security tests). The differentiator: **a gate must prove the policy *works*, not merely exist.** All policy lives in `source-of-truth/v2_supplement/security.json`; nothing security-relevant is hand-typed in code.

## Where it lives in the spine
| Concern | SOURCE (declare once) | PROJECTED | GATED |
|---|---|---|---|
| HTTP hardening | `security.json.headers` | dev server applies globally | `check_owasp_static` + `security_probe` |
| Input validation | field rules (canonical) | `gen_rules` validators | `security_probe` (4xx) · `check_owasp_static` (coverage) |
| Upload safety | upload kernel policy | storage kernel | `security_probe` (octet-stream + attachment) |
| Secrets | (none in source) | — | `check_owasp_static` (signature scan) |
| PII / DPDP | `security.json.privacy` | (classification) | `check_privacy` |
| AuthZ / RLS / RBAC | access-matrix (auth-last) | `gen_db` RLS, `gen_rules` guards | `check_access` *(deferred)* |

## What's BUILT + GATED (running list — ✅ done)
- **Global security headers** — CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` — source-declared, applied to every response, **probed**.
- **Input validation** — 183/183 user fields carry a rule (server-side); malformed input → **4xx**, **probed**.
- **Upload XSS hardening** — HTML/SVG/PDF served `application/octet-stream` + `Content-Disposition: attachment` + `nosniff` + sandbox CSP; images inline only. **Probed.**
- **Open-relay guard + rate-limit** — test-send is allowlist-gated (real provider) + rate-limited (20/10 min → **429**), **probed**.
- **No secrets in source** — signature scan (`xkeysib-`, `sk-…`, AWS/GitHub/GCP, PEM) across source/app. Secrets live in `.env.local` only.
- **Data localization** — Supabase **Mumbai / ap-south-1** (personal data resident in India).
- **DPDP children's-data** — `students` flagged as children-data; **verifiable guardian consent modeled** (`consent_obtained` + `consent_date` + `parent_guardian_name` already in the canonical model); PII classified per entity; right-to-erasure + localization declared. **Gated** by `check_privacy`.
- **Gates wired into `run_all`** — `check_owasp_static`, `security_probe`, `check_privacy` run **every build** (19 gates total).

## What's PENDING / DEFERRED (running list — ⏳)
**Auth-dependent (we wire auth LAST — these light up then; tracked in `security.json.deferred_auth_last` + memory):**
- RLS policies per table (`gen_db`) · RBAC enforcement (`check_access`: every action → a role) · IDOR / object-level-auth probe · auth-bypass probe (protected routes → 401) · session/cookie hardening (HttpOnly + Secure + SameSite) + CSRF tokens · security-event logging into `audit_events`.

**Privacy enforcement (DPDP — `security.json.privacy.deferred_enforcement`):**
- Enforce consent at student create (block unless `consent_obtained=true` — a `gen_rules` guard) · erasure endpoint cascading student → results/certificates · consent-withdrawal flow + audit · retention-sweep job.

**Hardening backlog:**
- At-rest / column-level encryption verification for PII (prod) · signed + expiring upload URLs + per-object access control · deeper dependency/slopsquat scanning · periodic external penetration test.

## OWASP Top-10 posture (summary)
A01 Broken access control → **deferred to auth** (RLS/RBAC/IDOR). · A02 Crypto → TLS + at-rest; PII flagged. · A03 Injection → parameterized canonical fields; 4xx on bad type (probed). · A04 Insecure design → the spine: every rule source-declared + gated. · A05 Misconfig → global headers + upload hardening (probed). · A07 AuthN → **deferred to auth**. · A08 Integrity → reproducibility receipt + drift gate; DO-NOT-EDIT surface. · A09 Logging → `audit_events` exists; wire on auth. · A10 SSRF → outbound calls are pinned kernels; no user-controlled server-side fetch.

## "Survive penetration testing", deterministically
`security_probe.py` is a deterministic mini-pen-test that runs **every build** and fails the build on a finding — so a security regression can't ship. As auth lands, the IDOR/auth-bypass/RBAC probes activate. This complements (does not replace) a periodic external pen-test.
