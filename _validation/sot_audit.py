#!/usr/bin/env python3
"""Source-of-truth validation: map every questionnaire row to verified implementation.
Appends columns (claude_status, claude_capability, claude_layer, claude_evidence) and
writes a downloadable CSV. Status reflects the PRIMARY capability of each decision,
mapped to facts verified this session (build/tests/runtime/Supabase)."""
import csv, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SRC = Path("versa-oms/source-of-truth/company_portal/versa_company_portal_questionnaire_answered_source_of_truth.csv")
OUT = Path("versa-oms/reports/source_of_truth_audit_23062026.csv")

# Built modules (data model + CRUD API + UI all green; build+tests pass).
BUILT = {"company_dashboard","staff_users","roles_permissions","school_crm","school_onboarding_ops",
 "student_roster_ops","finance_ops","exam_slot_ops","exam_material_ops","courier_ops","evaluation_ops",
 "results_ops","certificate_ops","notification_ops","support_tickets","task_work_queue","reports_exports",
 "admin_settings","security_audit_console"}

# Ordered rules: (regex, status, capability, layer, evidence). First match wins.
RULES = [
 # --- AUTH (highest priority gap) ---
 (r"log ?in|login|magic link|\botp\b|google login|google sso|\bsso\b|password|single sign|self.?regist|invite.?only|invite-only",
  "GAP","authentication / invite flow","none",
  "No login/auth/invite/session route or page exists (verified app rglob=NONE). Runs on dev-auth fallback (devAuthAllowed, NODE_ENV-gated). staff_invitations table exists, unused."),
 # --- Strong cross-cutting CONTROLS that ARE built+tested ---
 (r"dual approval|two.?person|maker|separation of duties",
  "GREEN","dual-approval (maker≠checker)","logic",
  "Enforced in kernel via approvals ledger (0004); same actor can't self-approve; 3 tests + runtime-verified (finance mark_paid applied:false until 2nd approver)."),
 (r"\baudit",
  "GREEN","audit","logic",
  "Append-only hash-chained audit writer (createAuditEvent, 0006 event_hash/prev_hash) wired in routeHandlers + jobs; runtime-verified persisted to Supabase (audit_events row, hash chain)."),
 (r"hard delete|archive|supersede|never delete|no delete",
  "GREEN","no-hard-delete","db",
  "DB no-hard-delete triggers on 22 business tables verified BLOCKING on Postgres + Supabase (0007); archived_at pattern in kernel."),
 (r"mask|candidate id only|only candidate|candidate ids? only|not see|hidden from|need.?to.?know|field restriction|see only counts|no student pii|parent contact",
  "GREEN","field masking","logic",
  "FIELD_MASKING_MATRIX -> config/masking.json + server/masking/masking.ts; 8 tests (parent_phone/email, answer_key, internal_note, candidate_id, finance-vs-student_name)."),
 (r"aadhaar|passport|bank account|forbidden field",
  "GREEN","forbidden-PII rejection","logic",
  "server/security/pii.ts rejects national-ID/financial fields; wired in kernel create+update; runtime-verified 422 on passport_number."),
 (r"idempoten|duplicate request|replay|duplicate (delivery|certificate|payment)",
  "GREEN","idempotency","logic",
  "X-Idempotency-Key required on writes (400 if missing, verified); idempotency_keys persisted to Supabase; worker jobs idempotent (tested)."),
 # --- Feature GAPs / PARTIALs (concrete unbuilt features) ---
 (r"payment link|gateway|razorpay|webhook|payment proof|manual payment|reconcil|refund|reversal|payment status|mark.*paid|confirm payment",
  "PARTIAL","payment processing","data+logic",
  "finance_ops tables/states/transitions + dual-approval present & tested; payment GATEWAY (links, webhook signature/idempotency, refund execution) NOT integrated; amounts not server-calculated."),
 (r"whatsapp|\bsms\b|send (announcement|message|reminder|notification|email)|deliver|retry|delivery|\bchannel\b|reminder|announcement|notification (template|delivery|failure|retry)|failed (notification|delivery)|in-?app",
  "PARTIAL","notification delivery","data+logic",
  "notification_ops tables + transition enqueues notification.dispatch_batch job (handler counts recipients); real email/in-app/SMS delivery + retry/DLQ delivery + templates render NOT implemented."),
 (r"\bomr\b|answer key|scoring|score batch|evaluation import|csv import|re-?evaluation|scan|instant result",
  "PARTIAL","evaluation / scoring","logic",
  "evaluation_ops tables + transitions (answer-key approve, approved_for_results) present & tested; scoring/ranking computed in server/eval (unit-tested) but NOT wired into services; real OMR/CSV ingest + key activation NOT built."),
 (r"certificate.*(pdf|generate|template|\bqr\b|download|digital signature|signature|reissue|revoke)|generate certificate|verification code|public verification",
  "PARTIAL","certificate generation","data+logic",
  "certificate_ops tables+transitions+verification-code(server/eval/certificate.ts)+public verify (runtime-verified READ from Supabase: 'Asha Rao'); certificate PDF + QR image + digital signature NOT built."),
 (r"\bexport|xlsx|watermark|downloadable|report download|\bcsv\b.*(report|export)",
  "PARTIAL","export generation","data",
  "reports_exports CRUD + export-approval transition + audit; actual CSV/XLSX/PDF file generation + watermark/metadata NOT built."),
 (r"candidate id.*(generat|automatic|staff.?trigger)|(generat|automatic).*candidate id",
  "GAP","candidate-ID generation","none",
  "Auto candidate-ID generation on roster lock NOT implemented (field exists in students schema; no generator)."),
 (r"invoice|receipt|\bgst\b|\btax\b",
  "PARTIAL","invoicing","data",
  "finance schema has invoice/receipt fields; receipt/GST/tax-invoice GENERATION NOT built."),
 (r"signed url|private file|material download|download history|question paper download|file storage|store .*priv",
  "PARTIAL","file storage / signed URL","data+logic",
  "server/files/signedUrl.ts real (Supabase Storage createSignedUrl from file_metadata, never leaks path); no bucket/file_metadata seeded so not E2E; finance+release gate on /api/school/materials verified (deny path 403)."),
 # --- Workflow / state transitions (built) ---
 (r"approve|publish|\block\b|revoke|reschedule|confirm|release|withhold|\bblock\b|suspend|lifecycle|status|\bstate\b|reissue|cancel|dispatch|receive|generate batch|submit",
  "GREEN","status transitions (gates)","logic",
  "Spec-derived audited gated transitions (lifecycle_states + HIGH_RISK_ACTIONS) present; high-risk = reason-required + dual-approval; tested + runtime-verified (e.g. core_results:generate fired results.generate_batch job)."),
 # --- Scope / assignment (PARTIAL enforcement) ---
 (r"scope|assignment|assigned (school|region|olympiad|queue)|department|region|restricted by|location",
  "PARTIAL","assignment-scope","logic",
  "Roles enforced (permission engine, tested); staff_assignment_scopes table + actor.scopes exist; non-admin staff scope-based data filtering NOT enforced (only school-scope filtering is). RLS deny-by-default verified at DB."),
 # --- RBAC (built) ---
 (r"role|permission|approval power|read.?only|who can|access control|rbac",
  "GREEN","RBAC","logic",
  "Server-side permission engine (registry.ts: default-deny, superuser bypass) wired in guards; browser-submitted role/scope ignored; tested. 20-role catalog not separately seeded."),
 # --- Dashboards ---
 (r"dashboard|\bkpi\b|metric|command center|critical alert|alerts panel|overview",
  "PARTIAL","dashboard","ui+api",
  "company_dashboard KPI tiles (real Supabase counts via /api/staff/overview, runtime-verified) + DashboardView; role-specific views + critical-alerts panel partial."),
 # --- CRM ---
 (r"\blead\b|\bcrm\b|duplicate|dedupe|pipeline|follow.?up|brochure|demo|nurture|lost reason|conver",
  "PARTIAL","CRM","data+api",
  "school_crm CRUD + lead-stage transitions + UI; lead DEDUPE + CSV import + follow-up task automation NOT built."),
 # --- Tasks / SLA ---
 (r"task|work queue|\bsla\b|escalat|overdue|workload",
  "PARTIAL","task queue","data+api",
  "task_work_queue CRUD + UI; auto-task-from-workflow-events + SLA tracking + escalation NOT built. Worker job runner (separate) IS built+tested."),
 # --- Roster ---
 (r"roster|upload student|student list|on behalf",
  "PARTIAL","student roster","data+api",
  "student_roster_ops CRUD + lock transition + UI; post-lock-edit-block + candidate-ID gen + staff_uploaded source enforcement NOT built."),
 # --- Courier ---
 (r"courier|\bawb\b|shipment|count mismatch|returned answer|logistics",
  "PARTIAL","courier","data+api",
  "courier_ops CRUD + dispatch/receive transitions + UI; AWB entry + count-mismatch resolution workflow + incident tracking partial."),
]

def classify(row):
    # Match on QUESTION + DECISION (the crisp scope), not the incidental answer prose,
    # to avoid false positives from words like "login"/"candidate IDs" appearing in passing.
    text = " ".join([row.get("question",""), row.get("decision","")]).lower()
    mods = [m.strip() for m in re.split(r"[;,]", row.get("affected_company_portal_modules","")) if m.strip()]
    for pat, status, cap, layer, ev in RULES:
        if re.search(pat, text):
            return status, cap, layer, ev
    # default: module(s) built -> PARTIAL scaffold, else GAP
    if mods and any(m in BUILT for m in mods):
        return ("PARTIAL","module scaffold","data+api+ui",
                "Affected module(s) have data model + CRUD API + UI (green build/tests); this specific business rule not separately verified at runtime.")
    return ("GAP","unmapped","none","No matching implemented capability identified for this scope item.")

with open(SRC, encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    fields = reader.fieldnames
    rows = list(reader)

newcols = ["claude_status","claude_capability","claude_layer","claude_evidence"]
from collections import Counter
counts = Counter()
with open(OUT, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields + newcols)
    w.writeheader()
    for row in rows:
        st, cap, layer, ev = classify(row)
        counts[st] += 1
        row.update({"claude_status":st,"claude_capability":cap,"claude_layer":layer,"claude_evidence":ev})
        w.writerow(row)

print("rows audited:", len(rows))
print("status counts:", dict(counts))
# capability breakdown
capc = Counter(classify(r)[1] for r in rows)
print("\ntop capabilities:")
for c,n in capc.most_common(): print(f"  {n:3}  {c}")
print("\nwrote:", OUT)
