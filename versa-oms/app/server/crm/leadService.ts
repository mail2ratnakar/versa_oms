// GENERATED from spec/actions/school_crm.actions.json by _validation/gen_actions.py — DO NOT EDIT.
// To change CRM actions, edit the spec and re-run: python _validation/gen_actions.py
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findDuplicates, type Lead } from "@/server/crm/dedupe";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import { maskRecords, maskRecord } from "@/server/masking/masking";
import { applyListFilters, applyListSort, facetCounts } from "@/server/lib/listQuery";
import type { Actor } from "@/server/types";

export const CRM_STAGES = ["new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed", "proposal_sent", "follow_up", "payment_pending", "converted", "lost"] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export function normalizeName(s?: string): string { return (s || "").toLowerCase().trim().replace(/\s+/g, " "); }
function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }
function actorId(a: Actor): string | null { return isUuid(a.actor_id) ? a.actor_id : null; }

const LIST_CFG = {"filterColumns": ["stage", "lead_status", "lead_source"], "searchColumns": ["school_name", "city", "email", "phone"], "sortColumns": ["created_at", "followup_date", "estimated_value"], "defaultSort": {"column": "created_at", "ascending": false}, "ownerColumn": "lead_owner_id", "facetColumn": "stage", "facetValues": ["new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed", "proposal_sent", "follow_up", "payment_pending", "converted", "lost"]};
export async function listLeads(actor: Actor, searchParams: URLSearchParams) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const size = Math.min(100, Number.parseInt(searchParams.get("page_size") ?? "50", 10) || 50);
  try {
    const supabase = createSupabaseAdminClient();
    const base = () => supabase.from("school_leads").select("*", { count: "exact" }).is("archived_at", null);
    let q = applyListFilters(base(), searchParams, LIST_CFG, actor);
    q = applyListSort(q, searchParams, LIST_CFG).range((page - 1) * size, page * size - 1);
    const { data, count } = await q;
    const items = maskRecords((data ?? []) as Array<Record<string, unknown>>, actor);
    const facetBase = () => supabase.from("school_leads").select("*", { count: "exact", head: true }).is("archived_at", null);
    const facets = await facetCounts(facetBase, searchParams, LIST_CFG, actor);
    return { items, pagination: { page, page_size: size, total_count: count ?? items.length, has_next: (count ?? 0) > page * size, next_cursor: null }, facets };
  } catch {
    return { items: [], pagination: { page, page_size: size, total_count: 0, has_next: false, next_cursor: null } };
  }
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

  const now = new Date().toISOString();
  const row: Record<string, unknown> = { "lead_code": "LEAD-" + crypto.randomUUID().slice(0, 8).toUpperCase(), "school_name": String(payload.school_name ?? "").trim(), "normalized_school_name": normalizeName(String(payload.school_name)), "board": payload.board ?? null, "city": String(payload.city ?? "").trim(), "state": String(payload.state ?? "").trim(), "country": String(payload.country ?? "").trim(), "lead_source": String(payload.lead_source ?? "").trim(), "email": payload.email ?? null, "phone": payload.phone ?? null, "coordinator_name": payload.coordinator_name ?? null, "principal_name": payload.principal_name ?? null, "expected_student_count": payload.expected_student_count ?? null, "lead_owner_id": payload.lead_owner_id ?? null, "stage": "new_lead", "lead_status": "active", "updated_at": now, "created_by": actorId(actor) };
  const { data, error } = await supabase.from("school_leads").insert(row).select().single();
  if (error) throw new ValidationError([{ field: "lead", message: error.message }]);
  await createAuditEvent({ sourceModule: "school_crm", action: "create_lead", actor, entityType: "school_leads", entityId: String(data.id), reason: `lead ${row.lead_code}` });
  return { "lead": maskRecord(data as Record<string, unknown>, actor), duplicate_warning: duplicateWarning };
}

export async function setStage(actor: Actor, id: string, stage: string) {
  if (!CRM_STAGES.includes(stage as CrmStage)) throw new ValidationError([{ field: "stage", message: `Unknown stage '${stage}'.` }]);
  const now = new Date().toISOString();
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_leads").update({ "stage": stage, "updated_at": now }).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "set_stage", actor, entityType: "school_leads", entityId: id, newStatus: stage, reason: `stage -> ${stage}` });
  return { id: id, stage: stage, applied: true };
}

export async function assignLead(actor: Actor, id: string, ownerId: string) {
  if (!ownerId || !String(ownerId).trim()) throw new ValidationError([{ field: "lead_owner_id", message: "lead_owner_id is required." }]);
  const now = new Date().toISOString();
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_leads").update({ "lead_owner_id": ownerId, "updated_at": now }).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "assign_lead", actor, entityType: "school_leads", entityId: id, reason: `owner -> ${ownerId}` });
  return { id: id, lead_owner_id: ownerId, applied: true };
}

export async function markLost(actor: Actor, id: string, reason: string) {
  if (!reason || !String(reason).trim()) throw new ValidationError([{ field: "reason", message: "reason is required." }]);
  const now = new Date().toISOString();
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_leads").update({ "lead_status": "lost", "stage": "lost", "lost_reason": reason, "updated_at": now }).eq("id", id);
  } catch { /* local */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "mark_lost", actor, entityType: "school_leads", entityId: id, newStatus: "lost", reason: reason });
  return { id: id, lead_status: "lost", lost_reason: reason, applied: true };
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

export async function importLeads(actor: Actor, leads: Array<Record<string, unknown>>) {
  const supabase = createSupabaseAdminClient();
  let existing: Lead[] = [];
  try {
    const { data } = await supabase.from("school_leads").select("school_name, city, state, email, phone, website").is("archived_at", null);
    existing = (data ?? []) as Lead[];
  } catch { existing = []; }
  const { unique, duplicates } = findDuplicates(leads as Lead[], existing);
  let imported = 0;
  try {
    const db = createSupabaseAdminClient();
    for (const lead of unique) {
      const { error } = await db.from("school_leads").insert(lead as Record<string, unknown>);
      if (!error) imported++;
    }
  } catch { /* best-effort persistence */ }
  await createAuditEvent({ sourceModule: "school_crm", action: "import_leads", actor, entityType: "school_leads", entityId: "import", reason: `imported ${imported}, ${duplicates.length} duplicates skipped` });
  return { submitted: leads.length, imported, duplicates_skipped: duplicates.length, duplicates };
}
