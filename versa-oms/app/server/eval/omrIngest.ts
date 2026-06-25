// OMR response import (FRAMEWORK — FR-OMR-IMPORT-0010). Parses an uploaded responses CSV into
// per-candidate response payloads and persists evaluation_candidate_responses for an import batch —
// the chain's real entry point (upstream of scoring). Reuses the roster CSV tokenizer. Parsing is
// pure (unit-tested); the DB write is idempotent.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import { parseCsv } from "@/server/lib/rosterIngest";
import type { Actor } from "@/server/types";

export type ParsedResponse = { candidate_id: string; responses: Record<string, string> };
export type OmrParseResult = { ok: boolean; errors: string[]; rows: ParsedResponse[] };

// Parse a responses CSV: header must include `candidate_id` + one or more question columns (Q1, Q2, …).
// Each data row -> { candidate_id, responses: {Q1: ..., ...} }. Pure.
export function parseOmrResponses(content: string): OmrParseResult {
  const matrix = parseCsv(content);
  if (!matrix.length) return { ok: false, errors: ["File is empty."], rows: [] };
  const headers = matrix[0].map((h) => h.trim());
  const ci = headers.findIndex((h) => h.toLowerCase() === "candidate_id");
  if (ci < 0) return { ok: false, errors: ["Missing required column 'candidate_id'."], rows: [] };
  const qCols = headers.map((h, i) => ({ h: h.trim(), i })).filter((x) => x.i !== ci && /^q\d+$/i.test(x.h));
  if (!qCols.length) return { ok: false, errors: ["No question columns found (expected Q1, Q2, …)."], rows: [] };

  const rows: ParsedResponse[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  matrix.slice(1).forEach((cells, idx) => {
    const cand = (cells[ci] ?? "").trim();
    if (!cand) { errors.push(`Row ${idx + 1}: missing candidate_id.`); return; }
    if (seen.has(cand)) { errors.push(`Row ${idx + 1}: duplicate candidate_id '${cand}'.`); return; }
    seen.add(cand);
    const responses: Record<string, string> = {};
    for (const { h, i } of qCols) responses[h.toUpperCase()] = (cells[i] ?? "").trim();
    rows.push({ candidate_id: cand, responses });
  });
  return { ok: rows.length > 0, errors, rows };
}

export type OmrIngestResult = { import_batch_id: string; imported: number; invalid: number; batch_status: string };

export async function ingestOmrBatch(input: { actor: Actor; importBatchId: string; content?: string; filename?: string }): Promise<OmrIngestResult> {
  if (!input.content || typeof input.content !== "string") {
    throw new ValidationError([{ field: "content", message: "File content is required." }]);
  }
  const supabase = createSupabaseAdminClient();
  const { data: ib } = await supabase.from("evaluation_import_batches").select("*").eq("id", input.importBatchId).maybeSingle();
  if (!ib) throw new ValidationError([{ field: "id", message: "Import batch not found." }]);
  const batch = ib as Record<string, unknown>;
  const schoolId = batch.school_id as string | null;
  if (!schoolId) throw new ValidationError([{ field: "school_id", message: "Import batch has no school; cannot attribute responses." }]);

  const parsed = parseOmrResponses(input.content);
  if (!parsed.rows.length) throw new ValidationError(parsed.errors.map((m) => ({ field: "file", message: m })));

  const rows = parsed.rows.map((r) => ({
    import_batch_id: input.importBatchId,
    candidate_id: r.candidate_id,
    school_id: schoolId,
    response_payload: r.responses,
    response_status: "parsed",
  }));
  const { error } = await supabase.from("evaluation_candidate_responses").upsert(rows, { onConflict: "import_batch_id,candidate_id" });
  if (error) throw new ValidationError([{ field: "responses", message: "Failed to persist responses." }]);

  await supabase
    .from("evaluation_import_batches")
    .update({
      imported_sheet_count: parsed.rows.length,
      valid_sheet_count: parsed.rows.length,
      invalid_sheet_count: parsed.errors.length,
      // NOTE: source_file is a uuid (stored-file ref) — binary storage deferred; the parsed rows are the artifact.
      batch_status: "validated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.importBatchId);
  await createAuditEvent({
    sourceModule: "evaluation_ops_import_batches", action: "import_responses", actor: input.actor,
    entityType: "evaluation_import_batches", entityId: input.importBatchId, newStatus: "validated",
    reason: `imported ${parsed.rows.length} candidate responses`,
  });

  return { import_batch_id: input.importBatchId, imported: parsed.rows.length, invalid: parsed.errors.length, batch_status: "validated" };
}
