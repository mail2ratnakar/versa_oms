/**
 * Tables whose single-record reads are themselves auditable events (PII, keys,
 * raw scans, scores, payment payloads). Opening one of these writes a `read`
 * audit row — per "audit all staff actions that access sensitive records".
 */
export const SENSITIVE_READ_TABLES = new Set([
  "students",
  "evaluation_answer_keys",
  "evaluation_candidate_responses",
  "omr_imports",
  "candidate_results",
  "finance_payments",
]);
