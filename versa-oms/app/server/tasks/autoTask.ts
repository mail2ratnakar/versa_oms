/**
 * Workflow events -> auto-created work-queue tasks (approvals, follow-ups, exceptions).
 * Pure mapping; the kernel inserts the task row on a matching transition.
 */
const EVENT_TASKS: Record<string, { title: string; queue: string }> = {
  "school_onboarding_ops:submit": { title: "Approve school onboarding", queue: "onboarding" },
  "finance_ops:mark_paid": { title: "Verify payment confirmation", queue: "finance" },
  "exam_material_ops:generate": { title: "Approve material release", queue: "materials" },
  "exam_material_ops:release": { title: "Confirm material release", queue: "materials" },
  "evaluation_ops:approve_for_results": { title: "Approve results for publication", queue: "evaluation" },
  "results_ops:publish": { title: "Verify result publication", queue: "results" },
  "courier_ops:dispatch": { title: "Enter courier receipt on return", queue: "courier" },
  "certificate_ops:reissue": { title: "Review certificate reissue", queue: "certificates" },
};

export function taskFromTransition(
  moduleId: string,
  action: string,
  recordId: string
): { title: string; queue: string; module: string; entity_id: string; status: string } | null {
  const t = EVENT_TASKS[`${moduleId}:${action}`];
  return t ? { title: t.title, queue: t.queue, module: moduleId, entity_id: recordId, status: "open" } : null;
}
