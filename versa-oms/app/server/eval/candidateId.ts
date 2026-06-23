/**
 * Deterministic candidate-ID formatting. Pure. The sequence is assigned
 * server-side on roster lock (never client-supplied), padded and prefixed so IDs
 * are unique + sortable within a school/olympiad.
 */
export function makeCandidateId(prefix: string, seq: number, width = 5): string {
  const clean = (prefix || "CAND").toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12);
  return `${clean}-${String(seq).padStart(width, "0")}`;
}

/** Build candidate IDs for an ordered list of student ids, starting at `start`. */
export function assignCandidateIds(studentIds: string[], prefix: string, start = 1): Array<{ id: string; candidate_id: string }> {
  return studentIds.map((id, i) => ({ id, candidate_id: makeCandidateId(prefix, start + i) }));
}
