import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "result_batch_id": z.string().uuid(),
    "target_visibility": z.string(),
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
  moduleId: "results_ops_publication_windows",
  table: "result_publication_windows",
  scope: "staff",
  statusColumn: "publication_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "operations_head", "results_approver", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "download": ["school_coordinator"]},
  transitions: {"schedule": {"target": "scheduled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["publication_status", "target_visibility"], "searchColumns": ["publication_code"], "sortColumns": ["created_at", "publication_status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "publication_status", "facetValues": ["draft", "scheduled", "published", "paused", "cancelled", "archived"]},
  createSchema,
});
