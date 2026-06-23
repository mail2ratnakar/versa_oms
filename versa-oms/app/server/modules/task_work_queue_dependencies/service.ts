import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "task_id": z.string().uuid(),
    "dependency_type": z.string(),
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
  moduleId: "task_work_queue_dependencies",
  table: "task_dependencies",
  scope: "staff",
  statusColumn: "dependency_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "module_owner", "operations_head", "queue_manager", "security_admin_reviewer", "staff_user", "super_admin", "support_executive", "support_manager"], "write": ["company_admin", "operations_head", "queue_manager", "super_admin", "support_manager"], "approve": ["auditor_read_only_reviewer", "module_owner", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
