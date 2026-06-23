/**
 * Ranking snapshot. Pure: rank candidates by score using standard "competition
 * ranking" (1,2,2,4) with configurable tie-break. Returns an immutable snapshot
 * shape suitable for persistence.
 */
export type Scored = { candidateId: string; score: number; tieBreak?: number };
export type Ranked = Scored & { rank: number };

export function rankCandidates(rows: Scored[], opts: { dense?: boolean } = {}): Ranked[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.tieBreak ?? 0) - (a.tieBreak ?? 0);
  });
  const out: Ranked[] = [];
  let rank = 0;
  let denseRank = 0;
  let prevScore: number | null = null;
  let prevTie: number | null = null;
  sorted.forEach((row, i) => {
    const sameAsPrev = prevScore === row.score && prevTie === (row.tieBreak ?? 0);
    if (!sameAsPrev) {
      denseRank += 1;
      rank = i + 1;
    }
    out.push({ ...row, rank: opts.dense ? denseRank : rank });
    prevScore = row.score;
    prevTie = row.tieBreak ?? 0;
  });
  return out;
}
