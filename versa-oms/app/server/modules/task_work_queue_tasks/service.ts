import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "task_title": z.string(),
    "task_type": z.string(),
    "queue_id": z.string().uuid(),
  })
  .passthrough();

export const {
  listModuleRecords,
  createModuleRecord,
  getModuleRecord,
  updateModuleRecord,
  transitionModuleRecord,
  getTransition,
} = defineModuleService({
  moduleId: "task_work_queue_tasks",
  table: "work_tasks",
  scope: "staff",
  statusColumn: "task_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "module_owner", "operations_head", "queue_manager", "security_admin_reviewer", "staff_user", "super_admin", "support_executive", "support_manager"], "write": ["company_admin", "operations_head", "queue_manager", "super_admin", "support_manager"], "approve": ["auditor_read_only_reviewer", "module_owner", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"block": {"target": "blocked", "klass": "write", "reasonRequired": false, "dualApproval": false}, "escalate": {"target": "escalated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "reopen": {"target": "reopened", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "task_code",
  codePrefix: "TASK",
  listConfig: {"filterColumns": ["task_status", "task_type", "priority"], "searchColumns": ["task_code", "task_title", "outcome_code"], "sortColumns": ["created_at", "task_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "task_status", "facetValues": ["new", "queued", "assigned", "in_progress", "blocked", "waiting", "escalated", "completed", "cancelled", "reopened", "archived"], "ownerColumn": "assigned_to"},
  createSchema,
});
