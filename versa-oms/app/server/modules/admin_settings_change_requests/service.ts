import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "setting_version_id": z.string().uuid(),
    "change_type": z.string(),
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
  moduleId: "admin_settings_change_requests",
  table: "setting_change_requests",
  scope: "staff",
  statusColumn: "request_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "communications_manager", "company_admin", "exam_operations_manager", "finance_admin", "operations_head", "security_admin_reviewer", "super_admin"], "write": ["certificate_manager", "communications_manager", "company_admin", "exam_operations_manager", "finance_admin", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["security_admin_reviewer", "super_admin"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": true, "dualApproval": false}, "start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "apply": {"target": "applied", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "change_request_code",
  codePrefix: "CHANGE",
  listConfig: {"filterColumns": ["request_status", "change_type"], "searchColumns": ["change_request_code"], "sortColumns": ["created_at", "request_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "request_status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "applied", "cancelled", "expired", "archived"]},
  createSchema,
});
