// FR-UI-HARDENING-2026-0004 — write detail panels: add + review a parent's child rows (sub-collection).
// Generic, masked, audited, mass-assignment-safe (only declared fields are written; server sets actor/defaults).
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { maskRecord } from "@/server/masking/masking";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import type { Actor } from "@/server/types";

function actorUuid(a: Actor): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.actor_id) ? a.actor_id : null;
}
const clean = (v: unknown) => (String(v ?? "").trim() || null);

export type AddChildOpts = { required?: string[]; allowed?: string[]; actorColumn?: string; defaults?: Record<string, unknown>; module: string };
export async function addChildRecord(table: string, fkColumn: string, parentId: string, payload: Record<string, unknown>, actor: Actor, opts: AddChildOpts) {
  const required = opts.required ?? [];
  const missing = required.filter((k) => !String(payload[k] ?? "").trim());
  if (missing.length) throw new ValidationError(missing.map((f) => ({ field: f, message: "Required." })));
  const row: Record<string, unknown> = { [fkColumn]: parentId, ...(opts.defaults ?? {}) };
  for (const k of opts.allowed ?? []) if (payload[k] !== undefined) row[k] = clean(payload[k]);
  if (opts.actorColumn) row[opts.actorColumn] = actorUuid(actor);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw new ValidationError([{ field: "item", message: error.message }]);
  await createAuditEvent({ sourceModule: opts.module, action: `add_${table}`, actor, entityType: table, entityId: String((data as { id?: string }).id ?? ""), reason: `added to ${parentId}` });
  return { ...maskRecord(data as Record<string, unknown>, actor), applied: true };
}

export type ReviewChildOpts = { editable: string[]; reviewerColumn?: string; reviewedAtColumn?: string; module: string };
export async function reviewChildRecord(table: string, id: string, fkColumn: string, parentId: string, payload: Record<string, unknown>, actor: Actor, opts: ReviewChildOpts) {
  const supabase = createSupabaseAdminClient();
  const { data: orig } = await supabase.from(table).select("*").eq("id", id).eq(fkColumn, parentId).maybeSingle();
  if (!orig) throw new ValidationError([{ field: "id", message: "Record not found." }]);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  for (const f of opts.editable) if (payload[f] !== undefined) patch[f] = clean(payload[f]);
  if (opts.reviewerColumn) patch[opts.reviewerColumn] = actorUuid(actor);
  if (opts.reviewedAtColumn) patch[opts.reviewedAtColumn] = now;
  const { data, error } = await supabase.from(table).update(patch).eq("id", id).eq(fkColumn, parentId).select().single();
  if (error) throw new ValidationError([{ field: "item", message: error.message }]);
  await createAuditEvent({ sourceModule: opts.module, action: `review_${table}`, actor, entityType: table, entityId: id, reason: String(payload.review_note ?? payload.reason ?? "reviewed"), externalReference: JSON.stringify({ before: { ...Object.fromEntries(opts.editable.map((f) => [f, (orig as Record<string, unknown>)[f]])) } }) });
  return { ...maskRecord(data as Record<string, unknown>, actor), applied: true };
}
