// Roster ingestion service (FRAMEWORK — reusable by both portals).
// Drives a student_roster_batches record through: parse+validate (rosterIngest
// engine) -> persist counts + validation/duplicate reports -> write valid students
// (only when the batch is fully clean) -> advance batch_status. Shared by the
// school route (school_coordinator self-upload) and the staff route (upload-on-
// behalf). School scope + staff assignment scope are enforced fail-closed.
//
// Spec: students/workflows.json (upload_students -> validate_upload),
// student_roster_ops/validation_policy.json (invalid/blocking-duplicate block lock),
// staff_upload_policy.json (on-behalf reason + source_type), roster_policy.json.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import { recordInScope } from "@/server/security/scope";
import { ingestRoster, type IngestResult } from "@/server/lib/rosterIngest";
import type { Actor } from "@/server/types";

const INGESTIBLE_STATUSES = new Set(["uploaded", "validation_failed"]);

export type IngestPayload = {
  file_type?: string;
  filename?: string;
  content?: string; // CSV text or base64-encoded XLSX
  source_type?: string; // staff path only: staff_uploaded_on_behalf
  reason?: string | null;
  allowed_grades?: string[] | null;
};

export type IngestOutcome = {
  batch_status: "validated" | "validation_failed";
  write_students: boolean;
};

// Pure decision (unit-tested): a batch is committable only when there are valid
// rows AND zero invalid AND zero blocking-duplicate rows (validation_policy:
// invalid_rows_block_lock + blocking_duplicates_block_lock). Otherwise it lands in
// validation_failed for review/retry and NO student rows are written.
export function decideIngestOutcome(result: IngestResult): IngestOutcome {
  const clean = result.ok && result.counts.valid > 0 && result.counts.invalid === 0 && result.counts.duplicate === 0;
  return clean
    ? { batch_status: "validated", write_students: true }
    : { batch_status: "validation_failed", write_students: false };
}

type Db = ReturnType<typeof createSupabaseAdminClient>;

function ownsBatch(actor: Actor, batch: Record<string, unknown>): boolean {
  if (actor.actor_type === "school") return batch.school_id === actor.school_id;
  // staff: fail-closed assignment scope (OWASP A01 IDOR)
  return recordInScope(actor, "student_roster_batches", batch);
}

async function existingDedupeKeys(supabase: Db, schoolId: string, participationId: string | null): Promise<Set<string>> {
  const keys = new Set<string>();
  try {
    let q = supabase.from("students").select("student_name,grade,school_roll_number").eq("school_id", schoolId).is("archived_at", null);
    if (participationId) q = q.eq("participation_id", participationId);
    const { data } = await q;
    for (const s of (data ?? []) as Array<Record<string, string>>) {
      const roll = (s.school_roll_number ?? "").trim();
      const key = roll
        ? `roll:${roll.toLowerCase()}`
        : `name:${(s.student_name ?? "").toLowerCase().trim().replace(/\s+/g, " ")}|grade:${(s.grade ?? "").trim().toLowerCase()}`;
      keys.add(key);
    }
  } catch {
    /* no DB locally — engine still dedupes within-file */
  }
  return keys;
}

export type IngestServiceResult = {
  batch_id: string;
  batch_status: string;
  counts: IngestResult["counts"];
  validation_report: IngestResult["validation_report"];
  duplicate_report: IngestResult["duplicate_report"];
  students_written: number;
};

/**
 * Ingest an uploaded roster file into an existing batch.
 * Throws ValidationError (-> 422) for file-level errors / scope / state violations.
 */
export async function ingestRosterBatch(input: {
  actor: Actor;
  moduleId: string;
  batchId: string;
  payload: IngestPayload;
}): Promise<IngestServiceResult> {
  const { actor, batchId, payload } = input;
  const isStaff = actor.actor_type === "staff";

  if (!payload.content || typeof payload.content !== "string") {
    throw new ValidationError([{ field: "content", message: "File content is required." }]);
  }
  if (isStaff && !payload.reason) {
    // staff_upload_policy.json: reason_required for upload-on-behalf
    throw new ValidationError([{ field: "reason", message: "A reason is required for staff upload-on-behalf." }]);
  }

  const supabase = createSupabaseAdminClient();
  const { data: batchRow } = await supabase.from("student_roster_batches").select("*").eq("id", batchId).maybeSingle();
  if (!batchRow) throw new ValidationError([{ field: "id", message: "Roster batch not found." }]);
  const batch = batchRow as Record<string, unknown>;
  if (!ownsBatch(actor, batch)) throw new ValidationError([{ field: "id", message: "Record not in your scope." }]);

  const status = String(batch.batch_status ?? "");
  if (!INGESTIBLE_STATUSES.has(status)) {
    throw new ValidationError([{ field: "batch_status", message: `Cannot ingest a roster in status '${status}'.` }]);
  }

  const schoolId = String(batch.school_id);
  const participationId = (batch.participation_id as string | null) ?? null;
  const byteLength = Buffer.byteLength(payload.content, payload.file_type === "xlsx" ? "base64" : "utf8");

  const existingKeys = await existingDedupeKeys(supabase, schoolId, participationId);
  const result = ingestRoster(payload.content, {
    fileType: payload.file_type ?? "csv",
    byteLength,
    allowedGrades: payload.allowed_grades ?? null,
    existingKeys,
  });

  if (!result.ok) {
    // File-level rejection: status unchanged (school can fix and re-upload the same batch).
    throw new ValidationError(result.file_errors.map((m) => ({ field: "file", message: m })));
  }

  // Atomic claim (optimistic lock): move uploaded/validation_failed -> validating in one statement.
  // Only the winning concurrent ingest proceeds; a loser sees zero rows updated -> 409-style reject.
  // This prevents two parallel uploads from both committing students for the same batch.
  const { data: claimed } = await supabase
    .from("student_roster_batches")
    .update({ batch_status: "validating", updated_at: new Date().toISOString() })
    .eq("id", batchId)
    .in("batch_status", ["uploaded", "validation_failed"])
    .select("id");
  if (!claimed || claimed.length === 0) {
    throw new ValidationError([{ field: "batch_status", message: "This roster is already being processed." }]);
  }

  const outcome = decideIngestOutcome(result);
  let studentsWritten = 0;

  if (outcome.write_students && result.valid_rows.length) {
    const rows = result.valid_rows.map((r) => ({
      school_id: schoolId,
      participation_id: participationId,
      student_name: r.student_name,
      grade: r.grade,
      section: r.section,
      school_roll_number: r.school_roll_number,
      parent_guardian_name: r.parent_guardian_name,
      parent_contact: r.parent_contact,
      consent_obtained: r.consent_obtained,
      status: "valid",
    }));
    const { data: inserted, error } = await supabase.from("students").insert(rows).select("id");
    if (error) {
      // Release the claim so the batch is retryable rather than stuck in 'validating'.
      await supabase.from("student_roster_batches").update({ batch_status: "validation_failed", updated_at: new Date().toISOString() }).eq("id", batchId);
      throw new ValidationError([{ field: "students", message: "Failed to persist student rows." }]);
    }
    studentsWritten = (inserted ?? []).length;
  }

  // NOTE: source_file is a uuid reference to a stored file object — binary file storage is deferred
  // (decision FR-...-0002), so we do NOT write a filename here; the parsed content is the artifact.
  const sourceType = isStaff ? (payload.source_type || "staff_uploaded_on_behalf") : "school_uploaded";
  const { error: updErr } = await supabase
    .from("student_roster_batches")
    .update({
      total_rows: result.counts.total,
      valid_rows: result.counts.valid,
      invalid_rows: result.counts.invalid,
      duplicate_rows: result.counts.duplicate,
      validation_report: result.validation_report,
      duplicate_report: result.duplicate_report,
      batch_status: outcome.batch_status,
      source_type: sourceType,
      upload_reason: isStaff ? payload.reason ?? null : batch.upload_reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", batchId);
  // Never fail silently (P4.5): a swallowed update would leave the batch in 'uploaded' and block lock.
  if (updErr) throw new ValidationError([{ field: "batch", message: "Failed to record validation result on the roster batch." }]);

  await createAuditEvent({
    sourceModule: input.moduleId,
    action: "validate_upload",
    actor,
    entityType: "student_roster_batches",
    entityId: batchId,
    reason: payload.reason ?? null,
    previousStatus: status,
    newStatus: outcome.batch_status,
  });

  return {
    batch_id: batchId,
    batch_status: outcome.batch_status,
    counts: result.counts,
    validation_report: result.validation_report,
    duplicate_report: result.duplicate_report,
    students_written: studentsWritten,
  };
}
