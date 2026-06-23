// GENERATED from spec/modules/<m>/workflows.json by _validation/gen_guards.py — DO NOT EDIT.
// status -> allowed actions (lifecycle edges). To change, edit the workflow spec and re-run.

export const TRANSITION_GUARDS: Record<string, Record<string, string[]>> = {
  "school_onboarding_ops": {
    "draft": ["archive", "submit"],
    "submitted": ["approve", "archive", "reject"],
    "under_review": ["approve", "archive", "reject"],
    "needs_more_info": ["archive", "submit"],
    "approved": ["activate", "archive", "block", "suspend"],
    "rejected": ["archive"],
    "activated": ["archive", "block", "suspend"],
    "blocked": ["archive"],
    "suspended": ["archive"],
    "archived": ["archive"]
  }
};

export function isActionAllowedFrom(moduleId: string, status: string | null, action: string): boolean {
  const g = TRANSITION_GUARDS[moduleId];
  if (!g || !status) return true;
  const allowed = g[status];
  if (!allowed) return true;
  return allowed.includes(action);
}
