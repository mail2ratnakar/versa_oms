import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "request_type": z.string(),
    "requested_by": z.string().uuid(),
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
  moduleId: "certificate_ops_requests",
  table: "certificate_requests",
  scope: "staff",
  statusColumn: "request_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["certificate_manager", "company_admin", "super_admin"], "approve": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "operations_head", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["certificate_manager", "company_admin", "security_admin_reviewer", "super_admin"], "download": ["school_coordinator"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": true, "dualApproval": false}, "start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "apply": {"target": "applied", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "request_code",
  codePrefix: "REQUES",
  listConfig: {"filterColumns": ["request_status", "request_type"], "searchColumns": ["request_code"], "sortColumns": ["created_at", "request_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "request_status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "applied", "cancelled", "archived"]},
  createSchema,
});
