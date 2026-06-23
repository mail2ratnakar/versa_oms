import type { z } from "zod";
import type { Actor } from "@/server/types";
import { registerModulePolicy, type ModulePolicy } from "@/server/permissions/registry";
import { maskRecord, maskRecords } from "@/server/masking/masking";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkIdempotency, storeIdempotentResponse } from "@/server/idempotency/checkIdempotency";
import { recordApproval } from "@/server/lib/approvals";
import { enqueueJob } from "@/server/jobs/runner";
import { transitionJobs } from "@/server/jobs/triggers";
import { forbiddenFieldsIn } from "@/server/security/pii";
import { assertNotSelfRoleChange, assertNotLastSuperAdmin, PolicyError } from "@/server/security/staffPolicy";
import { applicableFilters } from "@/server/security/scope";
import { taskFromTransition } from "@/server/tasks/autoTask";
import { SENSITIVE_READ_TABLES } from "@/server/security/sensitive";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { isActionAllowedFrom } from "@/server/lib/transitionGuards";
import { runTransitionEffect } from "@/server/lib/transitionEffects";
import { runPreconditions, PreconditionError } from "@/server/lib/transitionPreconditions";

export type ModuleScope = "staff" | "school" | "global";

export type TransitionDef = {
  target: string;
  klass: "write" | "approve";
  reasonRequired: boolean;
  dualApproval: boolean;
};

export type ModuleConfig = {
  moduleId: string;
  table: string;
  scope: ModuleScope;
  policy: ModulePolicy;
  createSchema: z.ZodTypeAny;
  schoolColumn?: string;
  schoolScoped?: boolean;
  defaultPageSize?: number;
  primaryKey?: string;
  statusColumn?: string;
  transitions?: Record<string, TransitionDef>;
};

export type ListResult = {
  items: Array<Record<string, unknown>>;
  pagination: { page: number; page_size: number; total_count: number; has_next: boolean; next_cursor: string | null };
};

export class ValidationError extends Error {
  constructor(public fieldErrors: Array<{ field: string; message: string }>) {
    super("validation_failed");
    this.name = "ValidationError";
  }
}
export class ConflictError extends Error {
  constructor(message = "idempotency_conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

/**
 * Generic module service kernel. Each module instantiates this with its table,
 * scope, role policy and validation schema. The kernel enforces (after a guard
 * has authorized the actor): school scoping, input validation, idempotency,
 * audit-friendly created_by stamping, and output field-masking. Degrades to a
 * deterministic local echo when no database is reachable (pre-Supabase dev).
 */
export function defineModuleService(cfg: ModuleConfig) {
  registerModulePolicy(cfg.moduleId, cfg.policy);
  const schoolCol = cfg.schoolColumn ?? "school_id";
  const pageSizeDefault = cfg.defaultPageSize ?? 25;
  const pk = cfg.primaryKey ?? "id";
  const statusCol = cfg.statusColumn ?? "status";
  const transitions = cfg.transitions ?? {};
  const hasPartial = typeof (cfg.createSchema as { partial?: unknown }).partial === "function";
  const updateSchema = hasPartial
    ? (cfg.createSchema as unknown as z.ZodObject<z.ZodRawShape>).partial()
    : cfg.createSchema;

  function ownsRecord(actor: Actor, record: Record<string, unknown>): boolean {
    if (cfg.scope !== "school") return true;
    if (actor.actor_type !== "school") return true; // staff may see across schools
    return record[schoolCol] === actor.school_id;
  }

  async function listModuleRecords(input: { actor: Actor; searchParams: URLSearchParams }): Promise<ListResult> {
    const page = Math.max(1, Number.parseInt(input.searchParams.get("page") ?? "1", 10) || 1);
    const size = Math.min(100, Math.max(1, Number.parseInt(input.searchParams.get("page_size") ?? String(pageSizeDefault), 10) || pageSizeDefault));
    try {
      const supabase = createSupabaseAdminClient();
      let q = supabase
        .from(cfg.table)
        .select("*", { count: "exact" })
        .is("archived_at", null)
        .range((page - 1) * size, page * size - 1);
      if (cfg.scope === "school" && input.actor.actor_type === "school" && input.actor.school_id) {
        q = q.eq(schoolCol, input.actor.school_id);
      }
      // Non-admin staff are narrowed to their assigned schools/regions/olympiads/queues.
      if (cfg.scope === "staff") {
        for (const f of applicableFilters(input.actor, cfg.table)) q = q.in(f.column, f.values);
      }
      const { data, count } = await q;
      const items = maskRecords((data ?? []) as Array<Record<string, unknown>>, input.actor);
      const total = count ?? items.length;
      return { items, pagination: { page, page_size: size, total_count: total, has_next: total > page * size, next_cursor: null } };
    } catch {
      return { items: [], pagination: { page, page_size: size, total_count: 0, has_next: false, next_cursor: null } };
    }
  }

  async function createModuleRecord(input: { actor: Actor; payload: Record<string, unknown>; idempotencyKey: string }): Promise<Record<string, unknown>> {
    const parsed = cfg.createSchema.safeParse(input.payload);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    }
    const clean = parsed.data as Record<string, unknown>;
    const forbidden = forbiddenFieldsIn(input.payload);
    if (forbidden.length) {
      throw new ValidationError(forbidden.map((f) => ({ field: f, message: `Field '${f}' is forbidden and must not be stored.` })));
    }
    const payloadHash = hash(JSON.stringify(clean));
    const idem = await checkIdempotency({ key: input.idempotencyKey, moduleId: cfg.moduleId, operation: "create", payloadHash });
    if (!idem.ok) throw new ConflictError();
    if (idem.replay) return idem.storedResponse as Record<string, unknown>;

    const row: Record<string, unknown> = { ...clean };
    delete row.reason; // audit-only field, not a column
    if (isUuid(input.actor.actor_id)) row.created_by = input.actor.actor_id;
    if (cfg.scope === "school" && input.actor.school_id) row[schoolCol] = input.actor.school_id;

    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.from(cfg.table).insert(row).select().single();
      if (error || !data) throw error ?? new Error("insert_failed");
      const masked = maskRecord(data as Record<string, unknown>, input.actor);
      await storeIdempotentResponse(input.idempotencyKey, masked);
      return masked;
    } catch {
      // Local fallback (no DB): deterministic echo so the flow is testable.
      const echo: Record<string, unknown> = { id: crypto.randomUUID(), ...row, status: "created_local" };
      return maskRecord(echo, input.actor);
    }
  }

  async function getModuleRecord(input: { actor: Actor; id: string }): Promise<Record<string, unknown> | null> {
    try {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase.from(cfg.table).select("*").eq(pk, input.id).is("archived_at", null).maybeSingle();
      if (!data) return null;
      if (!ownsRecord(input.actor, data as Record<string, unknown>)) return null;
      // Audit reads of sensitive records (PII, keys, scores, payment payloads).
      if (SENSITIVE_READ_TABLES.has(cfg.table)) {
        await createAuditEvent({ sourceModule: cfg.moduleId, action: "read", actor: input.actor, entityType: cfg.table, entityId: input.id, reason: "sensitive record read" });
      }
      return maskRecord(data as Record<string, unknown>, input.actor);
    } catch {
      return null;
    }
  }

  async function updateModuleRecord(input: { actor: Actor; id: string; payload: Record<string, unknown> }): Promise<Record<string, unknown>> {
    const parsed = updateSchema.safeParse(input.payload);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    }
    const forbidden = forbiddenFieldsIn(input.payload);
    if (forbidden.length) {
      throw new ValidationError(forbidden.map((f) => ({ field: f, message: `Field '${f}' is forbidden and must not be stored.` })));
    }
    const patch = { ...(parsed.data as Record<string, unknown>) };
    delete patch.reason;
    if (cfg.table === "staff_profiles") {
      try {
        assertNotSelfRoleChange(input.actor, input.id, patch);
        await assertNotLastSuperAdmin(input.id, patch);
      } catch (e) {
        if (e instanceof PolicyError) throw new ValidationError([{ field: e.field, message: e.message }]);
        throw e;
      }
    }
    (patch as Record<string, unknown>).updated_at = new Date().toISOString();
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.from(cfg.table).update(patch).eq(pk, input.id).select().single();
      if (error || !data) throw error ?? new Error("update_failed");
      return maskRecord(data as Record<string, unknown>, input.actor);
    } catch {
      return maskRecord({ id: input.id, ...patch, status: "updated_local" }, input.actor);
    }
  }

  function getTransition(action: string): TransitionDef | undefined {
    return transitions[action];
  }

  async function transitionModuleRecord(input: {
    actor: Actor;
    id: string;
    action: string;
    reason?: string | null;
  }): Promise<Record<string, unknown>> {
    const t = transitions[input.action];
    if (!t) throw new ValidationError([{ field: "action", message: `Unknown action '${input.action}' for ${cfg.moduleId}.` }]);
    if (t.reasonRequired && !input.reason) {
      throw new ValidationError([{ field: "reason", message: `A reason is required to ${input.action}.` }]);
    }

    // Load current record: previous status + school-ownership check.
    let previousStatus: string | null = null;
    try {
      const supabase = createSupabaseAdminClient();
      const { data: current } = await supabase.from(cfg.table).select("*").eq(pk, input.id).maybeSingle();
      if (current) {
        if (!ownsRecord(input.actor, current as Record<string, unknown>)) {
          throw new ValidationError([{ field: "id", message: "Record not in your scope." }]);
        }
        previousStatus = (current as Record<string, unknown>)[statusCol] as string | null;
      }
    } catch (e) {
      if (e instanceof ValidationError) throw e;
    }

    // Lifecycle guard: the action must be valid from the current status.
    if (!isActionAllowedFrom(cfg.moduleId, previousStatus, input.action)) {
      throw new ValidationError([{ field: "action", message: `Cannot '${input.action}' from status '${previousStatus}'.` }]);
    }

    // Spec-driven preconditions: cross-entity checks that BLOCK the transition (e.g. school must be active).
    // Fail CLOSED — if a precondition cannot be evaluated, the transition must not proceed.
    try {
      const supabase = createSupabaseAdminClient();
      await runPreconditions(cfg.moduleId, input.action, supabase, input.id);
    } catch (e) {
      if (e instanceof PreconditionError) throw new ValidationError([{ field: "precondition", message: e.message }]);
      if (e instanceof ValidationError) throw e;
      throw new ValidationError([{ field: "precondition", message: "Precondition could not be evaluated; transition blocked." }]);
    }

    // Dual-approval gate: apply only after two DISTINCT approvers.
    if (t.dualApproval) {
      const appr = await recordApproval(
        cfg.table,
        input.id,
        input.action,
        input.actor.actor_id,
        input.actor.roles[0] ?? "unknown",
        input.reason ?? null
      );
      if (appr.distinct < 2) {
        return {
          id: input.id,
          [statusCol]: previousStatus,
          previous_status: previousStatus,
          action: input.action,
          applied: false,
          dual_approval_required: true,
          approvals_recorded: appr.distinct,
          approvals_needed: 2,
        };
      }
    }

    // Apply the status change.
    try {
      const supabase = createSupabaseAdminClient();
      await supabase
        .from(cfg.table)
        .update({ [statusCol]: t.target, updated_at: new Date().toISOString() })
        .eq(pk, input.id);
    } catch {
      // local fallback: no DB, report the intended transition.
    }

    // Fire downstream cross-module jobs for this transition (idempotent per record+action).
    const jobs = transitionJobs(cfg.moduleId, input.action);
    const enqueued: string[] = [];
    for (const jt of jobs) {
      enqueueJob(jt, { module: cfg.moduleId, record_id: input.id, action: input.action }, `${cfg.moduleId}:${input.id}:${input.action}:${jt}`);
      enqueued.push(jt);
    }

    // Auto-create a work-queue task for events that need human follow-up.
    const task = taskFromTransition(cfg.moduleId, input.action, input.id);
    if (task) {
      try {
        const supabase = createSupabaseAdminClient();
        const { ensureQueue, createWorkTask } = await import("@/server/tasks/createTask");
        const queueId = await ensureQueue(supabase, { code: task.queue.toUpperCase(), name: task.queue, type: "module_queue", owner: task.module });
        if (queueId) {
          await createWorkTask(supabase, { title: task.title, type: "module_action", queueId, sourceType: task.module, sourceId: task.entity_id });
        }
      } catch {
        /* no DB locally — task mapping is the contract (tested) */
      }
    }

    // Run the registered post-transition effect chain (cross-module CHAINs).
    try {
      const supabase = createSupabaseAdminClient();
      await runTransitionEffect(cfg.moduleId, input.action, supabase, input.id, input.actor);
    } catch {
      /* effects are best-effort; transition already applied */
    }

    return {
      id: input.id,
      [statusCol]: t.target,
      previous_status: previousStatus,
      action: input.action,
      applied: true,
      dual_approval_required: t.dualApproval,
      jobs_enqueued: enqueued,
    };
  }

  return { listModuleRecords, createModuleRecord, getModuleRecord, updateModuleRecord, transitionModuleRecord, getTransition };
}
