import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "queue_name": z.string(),
    "queue_type": z.string(),
    "owner_role": z.string(),
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
  moduleId: "task_work_queue",
  table: "task_queues",
  scope: "staff",
  statusColumn: "queue_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "module_owner", "operations_head", "queue_manager", "security_admin_reviewer", "staff_user", "super_admin", "support_executive", "support_manager"], "write": ["company_admin", "operations_head", "queue_manager", "super_admin", "support_manager"], "approve": ["auditor_read_only_reviewer", "module_owner", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["queue_status", "queue_type", "default_priority"], "searchColumns": ["queue_code", "queue_name"], "sortColumns": ["created_at", "queue_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "queue_status", "facetValues": ["active", "paused", "inactive", "archived"]},
  createSchema,
});
