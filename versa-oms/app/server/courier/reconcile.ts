/**
 * Courier count reconciliation. Compares dispatched vs received answer sheets;
 * a shortage/excess beyond tolerance needs manager approval before OMR proceeds. Pure.
 */
export function reconcileCount(
  dispatched: number,
  received: number,
  tolerance = 0
): { status: "matched" | "shortage" | "excess"; diff: number; needsApproval: boolean } {
  const diff = received - dispatched;
  const status = diff === 0 ? "matched" : diff < 0 ? "shortage" : "excess";
  return { status, diff, needsApproval: Math.abs(diff) > tolerance };
}
