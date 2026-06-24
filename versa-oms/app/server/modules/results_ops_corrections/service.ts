import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "result_id": z.string().uuid(),
    "correction_type": z.string(),
    "previous_values": z.any(),
    "new_values": z.any(),
    "reason": z.string(),
    "approved_by": z.string().uuid(),
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
  moduleId: "results_ops_corrections",
  table: "result_corrections",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "operations_head", "results_approver", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "download": ["school_coordinator"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["correction_type"], "searchColumns": ["correction_code"], "sortColumns": ["created_at"], "defaultSort": {"column": "created_at", "ascending": false}},
  createSchema,
});
