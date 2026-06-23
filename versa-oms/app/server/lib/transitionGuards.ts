/**
 * Valid actions per CURRENT status (server-enforced lifecycle edges). The
 * lifecycle specs list statuses but not from→to edges, so we declare them here.
 * Modules absent from this map allow any defined transition (back-compat).
 * Pure data — safe to import in client components for action-button gating.
 */
export const TRANSITION_GUARDS: Record<string, Record<string, string[]>> = {
  school_onboarding_ops: {
    draft: ["submit", "archive"],
    submitted: ["approve", "reject", "block"],
    under_review: ["approve", "reject", "block"],
    needs_more_info: ["submit", "reject", "archive"],
    approved: ["activate", "suspend", "block"],
    rejected: ["archive"],
    activated: ["suspend", "block"],
    blocked: ["suspend", "archive"],
    suspended: ["block", "archive"],
    archived: [],
  },
};

export function isActionAllowedFrom(moduleId: string, status: string | null, action: string): boolean {
  const g = TRANSITION_GUARDS[moduleId];
  if (!g || !status) return true;
  const allowed = g[status];
  if (!allowed) return true; // status not declared → don't block
  return allowed.includes(action);
}
