import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "request_type": z.string(),
    "proposed_change": z.any(),
    "reason": z.string(),
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
  moduleId: "roles_permissions_change_requests",
  table: "role_change_requests",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "staff_user", "super_admin"], "write": ["company_admin", "operations_head", "security_admin_reviewer", "staff_user", "super_admin"], "approve": ["company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": true, "dualApproval": false}, "start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "apply": {"target": "applied", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "request_code",
  codePrefix: "REQUES",
  listConfig: {"filterColumns": ["status", "request_type"], "searchColumns": ["request_code"], "sortColumns": ["created_at", "status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "applied", "cancelled", "archived"]},
  createSchema,
});
