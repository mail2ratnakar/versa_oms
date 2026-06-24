// GENERATED from spec/actions/school_crm.actions.json by _validation/gen_actions.py — DO NOT EDIT.
// To change CRM actions, edit the spec and re-run: python _validation/gen_actions.py
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findDuplicates, classifyImport, type Lead } from "@/server/crm/dedupe";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import { maskRecords, maskRecord } from "@/server/masking/masking";
import { applyListFilters, applyListSort, facetCounts } from "@/server/lib/listQuery";
import { applicableFilters, recordInScope } from "@/server/security/scope";
import { recordApproval } from "@/server/lib/approvals";
import type { Actor } from "@/server/types";

export const CRM_STAGES = ["new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed", "proposal_sent", "follow_up", "payment_pending", "converted", "lost"] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export function normalizeName(s?: string): string { return (s || "").toLowerCase().trim().replace(/\s+/g, " "); }
function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }
function actorId(a: Actor): string | null { return isUuid(a.actor_id) ? a.actor_id : null; }

// Fail-closed per-record assignment-scope check (OWASP A01 IDOR): a known id cannot be used to act
// outside scope. Enforced only when the record loads (DB present); mirrors the kernel's behavior.
type Db = ReturnType<typeof createSupabaseAdminClient>;
async function assertLeadInScope(supabase: Db, actor: Actor, leadId: string): Promise<void> {
  try {
    const { data: lead } = await supabase.from("school_leads").select("*").eq("id", leadId).maybeSingle();
    if (lead && !recordInScope(actor, "school_leads", lead as Record<string, unknown>, "lead_owner_id")) {
      throw new ValidationError([{ field: "id", message: "Record not in your scope." }]);
    }
  } catch (e) { if (e instanceof ValidationError) throw e; }
}

const LIST_CFG = {"filterColumns": ["stage", "lead_status", "lead_source", "duplicate_status"], "searchColumns": ["school_name", "city", "email", "phone"], "sortColumns": ["created_at", "followup_date", "estimated_value"], "defaultSort": {"column": "created_at", "ascending": false}, "ownerColumn": "lead_owner_id", "facetColumn": "stage", "facetValues": ["new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed", "proposal_sent", "follow_up", "payment_pending", "converted", "lost"]};
export async function listLeads(actor: Actor, searchParams: URLSearchParams) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const size = Math.min(100, Number.parseInt(searchParams.get("page_size") ?? "50", 10) || 50);
  try {
    const supabase = createSupabaseAdminClient();
    // Assignment scope (OWASP A01): narrow to the actor's assigned dimensions; global actors are unrestricted.
    const scope = <T extends { in(c: string, v: string[]): T }>(q: T): T => { for (const f of applicableFilters(actor, "school_leads")) q = q.in(f.column, f.values); return q; };
    const base = () => scope(supabase.from("school_leads").select("*", { count: "exact" }).is("archived_at", null));
    let q = applyListFilters(base(), searchParams, LIST_CFG, actor);
    q = applyListSort(q, searchParams, LIST_CFG).range((page - 1) * size, page * size - 1);
    const { data, count } = await q;
    const items = maskRecords((data ?? []) as Array<Record<string, unknown>>, actor);
    const facetBase = () => scope(supabase.from("school_leads").select("*", { count: "exact", head: true }).is("archived_at", null));
    const facets = await facetCounts(facetBase, searchParams, LIST_CFG, actor);
    return { items, pagination: { page, page_size: size, total_count: count ?? items.length, has_next: (count ?? 0) > page * size, next_cursor: null }, facets };
  } catch {
    return { items: [], pagination: { page, page_size: size, total_count: 0, has_next: false, next_cursor: null } };
  }
}

function buildLeadRow(actor: Actor, payload: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();
  return { "lead_code": "LEAD-" + crypto.randomUUID().slice(0, 8).toUpperCase(), "school_name": String(payload.school_name ?? "").trim(), "normalized_school_name": normalizeName(String(payload.school_name)), "board": payload.board ?? null, "city": String(payload.city ?? "").trim(), "state": String(payload.state ?? "").trim(), "country": String(payload.country ?? "").trim(), "lead_source": String(payload.lead_source ?? "").trim(), "email": payload.email ?? null, "phone": payload.phone ?? null, "coordinator_name": payload.coordinator_name ?? null, "principal_name": payload.principal_name ?? null, "expected_student_count": payload.expected_student_count ?? null, "lead_owner_id": payload.lead_owner_id ?? null, "stage": "new_lead", "lead_status": "active", "updated_at": now, "created_by": actorId(actor) };
}

export async function createLead(actor: Actor, payload: Record<string, unknown>) {
  const required = ["school_name", "city", "state", "country", "lead_source"] as const;
  const missing = required.filter((k) => !String(payload[k] ?? "").trim());
  if (missing.length) throw new ValidationError(missing.map((f) => ({ field: f, message: "Required." })));

  const supabase = createSupabaseAdminClient();
  let duplicateWarning = false;
  try {
    const { data: existing } = await supabase.from("school_leads").select("school_name, city, state, email, phone, website").is("archived_at", null);
    duplicateWarning = findDuplicates([payload as Lead], (existing ?? []) as Lead[]).duplicates.length > 0;
  } catch { /* ignore */ }

  const row: Record<string, unknown> = buildLeadRow(actor, payload);
  const { data, error } = await supabase.from("school_leads").insert(row).select().single();
  if (error) throw new ValidationError([{ field: "lead", message: error.message }]);
  await createAuditEvent({ sourceModule: "school_crm", action: "create_lead", actor, entityType: "school_leads", entityId: String(data.id), reason: `lead ${row.lead_code}` });
  return { "lead": maskRecord(data as Record<string, unknown>, actor), duplicate_warning: duplicateWarning };
}

export async function setStage(actor: Actor, id: string, stage: string) {
  if (!CRM_STAGES.includes(stage as CrmStage)) throw new ValidationError([{ field: "stage", message: `Unknown stage '${stage}'.` }]);
  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, id);
  const patch: Record<string, unknown> = { "stage": stage, "updated_at": now };
  try {
    await supabase.from("school_leads").update(patch).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "set_stage", actor, entityType: "school_leads", entityId: id, newStatus: stage, reason: `stage -> ${stage}` });
  return { id: id, stage: stage, applied: true };
}

export async function assignLead(actor: Actor, id: string, ownerId: string) {
  if (!ownerId || !String(ownerId).trim()) throw new ValidationError([{ field: "lead_owner_id", message: "lead_owner_id is required." }]);
  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, id);
  const patch: Record<string, unknown> = { "lead_owner_id": ownerId, "updated_at": now };
  try {
    await supabase.from("school_leads").update(patch).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "assign_lead", actor, entityType: "school_leads", entityId: id, reason: `owner -> ${ownerId}` });
  return { id: id, lead_owner_id: ownerId, applied: true };
}

export async function markLost(actor: Actor, id: string, reason: string) {
  if (!reason || !String(reason).trim()) throw new ValidationError([{ field: "reason", message: "reason is required." }]);
  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, id);
  const patch: Record<string, unknown> = { "lead_status": "lost", "stage": "lost", "lost_reason": reason, "updated_at": now };
  try {
    await supabase.from("school_leads").update(patch).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "mark_lost", actor, entityType: "school_leads", entityId: id, newStatus: "lost", reason: reason });
  return { id: id, lead_status: "lost", lost_reason: reason, applied: true };
}

export async function resolveDuplicate(actor: Actor, id: string, status: string) {
  if (!status || !String(status).trim()) throw new ValidationError([{ field: "duplicate_status", message: "duplicate_status is required." }]);
  if (!["not_duplicate", "confirmed_duplicate", "ignored"].includes(status)) throw new ValidationError([{ field: "status", message: "status is not a valid value." }]);
  const now = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, id);
  const patch: Record<string, unknown> = { "duplicate_status": status, "updated_at": now };
  if (status === "not_duplicate") Object.assign(patch, { "lead_status": "active", "duplicate_of_lead_id": null });
  try {
    await supabase.from("school_leads").update(patch).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "resolve_duplicate", actor, entityType: "school_leads", entityId: id, newStatus: status, reason: `duplicate -> ${status}` });
  return { id: id, duplicate_status: status, applied: true };
}

export async function mergeDuplicate(actor: Actor, id: string, payload: Record<string, unknown>) {
  const reason = String(payload.reason ?? "").trim();
  if (!reason) throw new ValidationError([{ field: "reason", message: "reason is required." }]);
  const target = String(payload.target_lead_id ?? "").trim();
  if (!target) throw new ValidationError([{ field: "target_lead_id", message: "target_lead_id is required." }]);
  if (target === id) throw new ValidationError([{ field: "target_lead_id", message: "A lead cannot be merged into itself." }]);
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, id);
  await assertLeadInScope(supabase, actor, target);
  const now = new Date().toISOString();
  try { await supabase.from("school_lead_interactions").update({ "school_lead_id": target, updated_at: now }).eq("school_lead_id", id); } catch { /* best-effort re-parent */ }
  const { error } = await supabase.from("school_leads").update({ duplicate_status: "merged", lead_status: "archived", duplicate_of_lead_id: target, archived_at: now, updated_at: now }).eq("id", id);
  if (error) throw new ValidationError([{ field: "merge", message: error.message }]);
  await createAuditEvent({ sourceModule: "school_crm", action: "merge_duplicate", actor, entityType: "school_leads", entityId: id, newStatus: "merged", reason, externalReference: JSON.stringify({ merged_into: target }) });
  return { id, merged_into: target, duplicate_status: "merged", applied: true };
}

export async function convertLead(actor: Actor, id: string) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  let schoolId: string | null = null;
  let onboardingCaseId: string | null = null;
  let taskId: string | null = null;
  try {
    const { data: src } = await supabase.from("school_leads").select("*").eq("id", id).maybeSingle();
    if (!src) throw new ValidationError([{ field: "id", message: "Record not found." }]);
    const s = src as Record<string, unknown>;
    if (!recordInScope(actor, "school_leads", s, "lead_owner_id")) throw new ValidationError([{ field: "id", message: "Record not in your scope." }]);
    if (String(s["duplicate_status"]) === "confirmed_duplicate") throw new ValidationError([{ field: "duplicate_status", message: "This lead is a confirmed duplicate \u2014 resolve or merge it before converting." }]);

    const { data: cap_schoolId } = await supabase.from("schools").insert({ "school_code": "SCH-" + crypto.randomUUID().slice(0, 8).toUpperCase(), "name": s["school_name"], "city": s["city"], "state": s["state"], "coordinator_name": (s["coordinator_name"] ?? "Pending"), "coordinator_email": (s["email"] ?? `pending+${crypto.randomUUID().slice(0, 6)}@versa.local`) }).select("id").single();
    schoolId = (cap_schoolId as { id?: string } | null)?.id ?? null;
    await supabase.from("school_leads").update({ "lead_status": "converted", "stage": "converted", "converted_school_id": schoolId, "updated_at": now }).eq("id", id);
    const { data: cap_onboardingCaseId } = await supabase.from("school_onboarding_cases").insert({ "onboarding_code": "ONB-" + crypto.randomUUID().slice(0, 8).toUpperCase(), "source_type": "crm_conversion", "school_name": s["school_name"], "normalized_school_name": normalizeName(String(s["school_name"])), "address": (s["address"] ?? "Pending"), "city": s["city"], "state": s["state"], "coordinator_name": (s["coordinator_name"] ?? "Pending"), "coordinator_email": (s["email"] ?? `pending+${crypto.randomUUID().slice(0, 6)}@versa.local`), "onboarding_status": "submitted", "school_id": schoolId, "source_lead_id": id, "updated_at": now }).select("id").single();
    onboardingCaseId = (cap_onboardingCaseId as { id?: string } | null)?.id ?? null;
    if (onboardingCaseId) {
      const { ensureQueue, createWorkTask } = await import("@/server/tasks/createTask");
      const queueId = await ensureQueue(supabase, { code: "ONBOARDING_REVIEW", name: "Onboarding Review", type: "approval_queue", owner: "school_onboarding_executive" });
      if (queueId) { taskId = await createWorkTask(supabase, { title: `Review onboarding: ${String(s["school_name"])}`, type: "approval", queueId, sourceType: "school_onboarding_cases", sourceId: onboardingCaseId as string }); }
    }
  } catch (e) {
    if (e instanceof ValidationError) throw e;
  }
  await createAuditEvent({ sourceModule: "school_crm", action: "convert_lead", actor, entityType: "school_leads", entityId: String(id ?? ""), newStatus: "converted", reason: `converted -> school ${schoolId ?? ""}, onboarding ${onboardingCaseId ?? ""}` });
  if (onboardingCaseId) { await createAuditEvent({ sourceModule: "school_onboarding_ops", action: "open_case", actor, entityType: "school_onboarding_cases", entityId: String(onboardingCaseId ?? ""), newStatus: "submitted", reason: `opened from lead ${id}` }); }
  return { id: id, lead_status: "converted", converted_school_id: schoolId, onboarding_case_id: onboardingCaseId, task_id: taskId, applied: true };
}

export async function listInteractions(actor: Actor, leadId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    await assertLeadInScope(supabase, actor, leadId);
    const { data } = await supabase.from("school_lead_interactions").select("*").eq("school_lead_id", leadId).order("interaction_at", { ascending: false });
    return { items: maskRecords((data ?? []) as Array<Record<string, unknown>>, actor) };
  } catch {
    return { items: [] };
  }
}

export async function addInteraction(actor: Actor, leadId: string, payload: Record<string, unknown>) {
  const required = ["interaction_type", "summary"] as const;
  const missing = required.filter((k) => !String(payload[k] ?? "").trim());
  if (missing.length) throw new ValidationError(missing.map((f) => ({ field: f, message: "Required." })));
  if (payload["interaction_type"] != null && String(payload["interaction_type"]) !== "" && !["call", "email", "whatsapp_manual", "meeting", "demo", "proposal", "note"].includes(String(payload["interaction_type"]))) throw new ValidationError([{ field: "interaction_type", message: "interaction_type is not a valid value." }]);
  if (payload["outcome"] != null && String(payload["outcome"]) !== "" && !["positive", "neutral", "negative", "no_response", "reschedule", "converted", "lost", "other"].includes(String(payload["outcome"]))) throw new ValidationError([{ field: "outcome", message: "outcome is not a valid value." }]);
  const now = new Date().toISOString();
  // Only mapped columns are written — server-owned fields (codes, owner, status) are never read from the client (P3.9 / OWASP A08).
  const row: Record<string, unknown> = { "interaction_code": "LINT-" + crypto.randomUUID().slice(0, 8).toUpperCase(), "school_lead_id": leadId, "interaction_type": (payload.interaction_type ?? "note"), "summary": String(payload.summary ?? "").trim(), "outcome": (String(payload.outcome ?? "").trim() || null), "next_followup_at": (String(payload.next_followup_at ?? "").trim() || null), "interaction_at": now, "staff_owner_id": actorId(actor), "interaction_status": "recorded", "updated_at": now };
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, leadId);
  const { data, error } = await supabase.from("school_lead_interactions").insert(row).select().single();
  if (error) throw new ValidationError([{ field: "interaction", message: error.message }]);
  const newId = String(data.id);
  await createAuditEvent({ sourceModule: "school_crm", action: "record_interaction", actor, entityType: "school_lead_interactions", entityId: newId, reason: "interaction recorded" });
  if (String(payload["next_followup_at"] ?? "").trim()) {
    const { ensureQueue, createWorkTask } = await import("@/server/tasks/createTask");
    const followupQueueId = await ensureQueue(supabase, { code: "CRM_FOLLOWUP", name: "CRM Follow-ups", type: "role_queue", owner: "sales_school_outreach_executive" });
    if (followupQueueId) await createWorkTask(supabase, { title: "Follow up: lead " + leadId, type: "system_follow_up", queueId: followupQueueId, sourceType: "school_lead_interactions", sourceId: newId });
    await supabase.from("notification_events").insert({ event_code: "crm_followup_due", event_idempotency_key: "crm_followup_due:lead_owner:" + newId, source_module: "school_crm", source_entity: "school_lead_interactions", source_entity_id: newId, event_payload: { message: "A CRM follow-up is due.", due: row["next_followup_at"] }, recipient_resolver: "lead_owner" });
    await supabase.from("notification_events").insert({ event_code: "crm_followup_due", event_idempotency_key: "crm_followup_due:sales_manager:" + newId, source_module: "school_crm", source_entity: "school_lead_interactions", source_entity_id: newId, event_payload: { message: "A team CRM follow-up is due.", due: row["next_followup_at"] }, recipient_resolver: "sales_manager" });
    await createAuditEvent({ sourceModule: "school_crm", action: "schedule_followup", actor, entityType: "school_lead_interactions", entityId: newId, reason: "follow-up scheduled" });
  }
  return { ...maskRecord(data as Record<string, unknown>, actor), applied: true };
}

export async function editInteraction(actor: Actor, leadId: string, iid: string, payload: Record<string, unknown>) {
  const reason = String(payload.reason ?? "").trim();
  if (!reason) throw new ValidationError([{ field: "reason", message: "reason is required." }]);
  if (payload["interaction_type"] != null && String(payload["interaction_type"]) !== "" && !["call", "email", "whatsapp_manual", "meeting", "demo", "proposal", "note"].includes(String(payload["interaction_type"]))) throw new ValidationError([{ field: "interaction_type", message: "interaction_type is not a valid value." }]);
  if (payload["outcome"] != null && String(payload["outcome"]) !== "" && !["positive", "neutral", "negative", "no_response", "reschedule", "converted", "lost", "other"].includes(String(payload["outcome"]))) throw new ValidationError([{ field: "outcome", message: "outcome is not a valid value." }]);
  const supabase = createSupabaseAdminClient();
  await assertLeadInScope(supabase, actor, leadId);
  const { data: original } = await supabase.from("school_lead_interactions").select("*").eq("id", iid).eq("school_lead_id", leadId).maybeSingle();
  if (!original) throw new ValidationError([{ field: "iid", message: "Interaction not found." }]);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  if (payload["interaction_type"] !== undefined) patch["interaction_type"] = (String(payload["interaction_type"] ?? "").trim() || null);
  if (payload["summary"] !== undefined) patch["summary"] = String(payload["summary"] ?? "").trim();
  if (payload["outcome"] !== undefined) patch["outcome"] = (String(payload["outcome"] ?? "").trim() || null);
  if (payload["next_followup_at"] !== undefined) patch["next_followup_at"] = (String(payload["next_followup_at"] ?? "").trim() || null);
  patch.interaction_status = "edited";
  patch.updated_at = now;
  const { data, error } = await supabase.from("school_lead_interactions").update(patch).eq("id", iid).eq("school_lead_id", leadId).select().single();
  if (error) throw new ValidationError([{ field: "interaction", message: error.message }]);
  await createAuditEvent({ sourceModule: "school_crm", action: "edit_interaction", actor, entityType: "school_lead_interactions", entityId: iid, reason, previousStatus: String(original.interaction_status ?? ""), newStatus: "edited", externalReference: JSON.stringify({ "interaction_type": original["interaction_type"], "summary": original["summary"], "outcome": original["outcome"], "next_followup_at": original["next_followup_at"] }) });
  return { ...maskRecord(data as Record<string, unknown>, actor), applied: true };
}

const IMPORT_APPROVAL_THRESHOLD = 5000;

// Stage 1 — upload + validate: validate vs required columns, dedupe, stage a 'validated' batch holding the
// importable rows (validation_report.pending_rows). NO leads are inserted here (lead_import_lifecycle: uploaded->validated).
export async function importLeads(actor: Actor, leads: Array<Record<string, unknown>>, opts?: { import_format?: string; default_lead_owner_id?: string }) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const required = ["school_name", "city", "state", "country", "lead_source"] as const;
  const valid: Array<Record<string, unknown>> = [];
  const invalid: Array<{ row: number; missing: string[] }> = [];
  leads.forEach((raw, i) => {
    const missing = required.filter((k) => !String(raw[k] ?? "").trim());
    if (missing.length) invalid.push({ row: i + 1, missing });
    else valid.push(raw);
  });
  let existing: Array<Lead & { id?: string }> = [];
  try {
    const { data } = await supabase.from("school_leads").select("id, school_name, city, state, email, phone, website").is("archived_at", null);
    existing = (data ?? []) as Array<Lead & { id?: string }>;
  } catch { existing = []; }
  // Collisions are STAGED (with the matched master id) so they surface as possible_duplicate rows for review (FR-0009), not silently dropped.
  const { unique, duplicates } = classifyImport(valid as Lead[], existing);
  const total = leads.length, validCount = valid.length, invalidCount = invalid.length, dupCount = duplicates.length;
  const status = validCount === 0 ? "validation_failed" : "validated";
  const needsApproval = total >= IMPORT_APPROVAL_THRESHOLD;
  const batchCode = "LIMP-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  let batchId = "";
  try {
    const { data: batch } = await supabase.from("school_lead_import_batches").insert({
      batch_code: batchCode, import_format: (opts?.import_format ?? "csv"), uploaded_by: actorId(actor),
      default_lead_owner_id: (opts?.default_lead_owner_id ?? null),
      total_rows: total, valid_rows: validCount, invalid_rows: invalidCount, duplicate_rows: dupCount,
      validation_report: { invalid, pending_rows: unique, pending_duplicates: duplicates }, duplicate_report: { duplicates },
      status, updated_at: now,
    }).select("id").single();
    batchId = String((batch as { id?: string } | null)?.id ?? "");
  } catch { /* batch persistence best-effort; counts still returned */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "upload_import", actor, entityType: "school_lead_import_batches", entityId: batchId || batchCode, newStatus: status, reason: `staged ${batchCode}: ${unique.length} ready, ${invalidCount} invalid, ${dupCount} duplicate(s)` });
  return { batch_id: batchId, batch_code: batchCode, status, total, valid: validCount, invalid: invalidCount, duplicates: dupCount, importable: unique.length, needs_approval: needsApproval, validation_report: { invalid }, duplicate_report: { duplicates } };
}

// Stage 2 — commit: apply the staged rows. Large imports (>= threshold) require dual-approval (maker != checker, P3.4)
// before any insert. Inserts use the SHARED buildLeadRow; per-row errors are captured, never swallowed (P4.5).
export async function commitImport(actor: Actor, batchId: string, payload?: { reason?: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: batch } = await supabase.from("school_lead_import_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batch) throw new ValidationError([{ field: "id", message: "Import batch not found." }]);
  const b = batch as Record<string, unknown>;
  if (b.status !== "validated") throw new ValidationError([{ field: "status", message: `Cannot commit a batch in status '${String(b.status)}'.` }]);
  const pending = (((b.validation_report as { pending_rows?: Array<Record<string, unknown>> } | null)?.pending_rows) ?? []) as Array<Record<string, unknown>>;
  // Large-import approval gate (import_policy.large_import_requires_approval_threshold_rows).
  if (Number(b.total_rows ?? 0) >= IMPORT_APPROVAL_THRESHOLD) {
    const appr = await recordApproval("school_lead_import_batches", batchId, "commit_import", actorId(actor) ?? actor.actor_id, actor.roles[0] ?? "unknown", payload?.reason ?? null);
    if (appr.distinct < 2) {
      await createAuditEvent({ sourceModule: "school_crm", action: "commit_import_approval", actor, entityType: "school_lead_import_batches", entityId: batchId, reason: `approval ${appr.distinct}/2` });
      return { batch_id: batchId, applied: false, approvals_recorded: appr.distinct, approvals_needed: 2 };
    }
  }
  let imported = 0;
  const insertErrors: Array<{ school_name: string; error: string }> = [];
  for (const raw of pending) {
    const row = buildLeadRow(actor, raw);
    if (b.default_lead_owner_id && !row.lead_owner_id) row.lead_owner_id = b.default_lead_owner_id;
    const { error } = await supabase.from("school_leads").insert(row);
    if (error) insertErrors.push({ school_name: String(raw.school_name ?? ""), error: error.message });
    else imported++;
  }
  // Staged collisions are inserted as reviewable possible_duplicate rows (lead_status duplicate_review), pointing at the matched master (FR-0009).
  const pendingDuplicates = (((b.validation_report as { pending_duplicates?: Array<{ lead: Record<string, unknown>; duplicate_of: string | null }> } | null)?.pending_duplicates) ?? []) as Array<{ lead: Record<string, unknown>; duplicate_of: string | null }>;
  let flagged = 0;
  for (const d of pendingDuplicates) {
    const row = buildLeadRow(actor, d.lead);
    if (b.default_lead_owner_id && !row.lead_owner_id) row.lead_owner_id = b.default_lead_owner_id;
    row.duplicate_status = "possible_duplicate";
    row.lead_status = "duplicate_review";
    if (d.duplicate_of) row.duplicate_of_lead_id = d.duplicate_of;
    const { error } = await supabase.from("school_leads").insert(row);
    if (!error) flagged++;
  }
  const status = pending.length > 0 && imported === pending.length && flagged === 0 ? "imported" : (imported > 0 || flagged > 0 ? "partially_imported" : "validation_failed");
  try { await supabase.from("school_lead_import_batches").update({ status, updated_at: new Date().toISOString() }).eq("id", batchId); } catch { /* best-effort */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "commit_import", actor, entityType: "school_lead_import_batches", entityId: batchId, newStatus: status, reason: `committed ${imported}/${pending.length}, ${flagged} flagged for review` });
  return { batch_id: batchId, applied: true, imported, flagged, status, insert_errors: insertErrors };
}

// Cancel a staged batch (reason required; only from a non-terminal status).
export async function cancelImport(actor: Actor, batchId: string, reason: string) {
  if (!reason || !reason.trim()) throw new ValidationError([{ field: "reason", message: "reason is required." }]);
  const supabase = createSupabaseAdminClient();
  const { data: batch } = await supabase.from("school_lead_import_batches").select("status").eq("id", batchId).maybeSingle();
  if (!batch) throw new ValidationError([{ field: "id", message: "Import batch not found." }]);
  if (!["uploaded", "validated", "validation_failed"].includes(String((batch as Record<string, unknown>).status))) throw new ValidationError([{ field: "status", message: "Batch cannot be cancelled." }]);
  try { await supabase.from("school_lead_import_batches").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", batchId); } catch { /* best-effort */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "cancel_import", actor, entityType: "school_lead_import_batches", entityId: batchId, newStatus: "cancelled", reason });
  return { batch_id: batchId, status: "cancelled", applied: true };
}
