import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "result_batch_id": z.string().uuid(),
    "candidate_id": z.string(),
    "school_id": z.string().uuid(),
    "raw_score": z.coerce.number(),
    "max_score": z.coerce.number(),
    "percentage_score": z.coerce.number(),
    "result_version": z.string(),
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
  moduleId: "results_ops_candidates",
  table: "candidate_results",
  scope: "staff",
  statusColumn: "result_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "operations_head", "results_approver", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "download": ["school_coordinator"]},
  transitions: {"generate": {"target": "generated", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "withhold": {"target": "withheld", "klass": "approve", "reasonRequired": true, "dualApproval": true}},
  listConfig: {"filterColumns": ["result_status", "certificate_eligibility_status"], "searchColumns": ["grade_code", "subject_code", "verification_code"], "sortColumns": ["created_at", "result_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "result_status", "facetValues": ["generated", "ranked", "approved", "published", "withheld", "corrected", "superseded", "voided"]},
  createSchema,
});
