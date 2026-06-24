import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "report_definition_id": z.string().uuid(),
    "requested_format": z.string(),
    "filter_payload": z.any(),
    "filter_hash": z.string(),
    "reason": z.string(),
    "sensitivity_level": z.string(),
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
  moduleId: "reports_exports_requests",
  table: "export_requests",
  scope: "staff",
  statusColumn: "export_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "communications_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_manager"], "write": ["analytics_owner", "certificate_manager", "communications_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "super_admin", "support_manager"], "approve": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["analytics_owner", "certificate_manager", "communications_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "security_admin_reviewer", "super_admin", "support_manager"], "download": ["company_admin", "finance_admin", "operations_head", "school_coordinator", "security_admin_reviewer"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "generate": {"target": "generated", "klass": "write", "reasonRequired": true, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["export_status", "requested_format", "sensitivity_level"], "searchColumns": ["export_code"], "sortColumns": ["created_at", "export_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "export_status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "queued", "generating", "generated", "failed", "expired", "cancelled", "archived"]},
  createSchema,
});
