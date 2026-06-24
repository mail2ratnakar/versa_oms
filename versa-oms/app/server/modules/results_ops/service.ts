import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "exam_cycle_id": z.string().uuid(),
    "evaluation_score_batch_id": z.string().uuid(),
    "handoff_snapshot_hash": z.string(),
    "result_version": z.string(),
    "ranking_policy_version": z.string(),
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
  moduleId: "results_ops",
  table: "result_batches",
  scope: "staff",
  statusColumn: "result_batch_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "operations_head", "results_approver", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "results_approver", "security_admin_reviewer", "super_admin"], "download": ["school_coordinator"]},
  transitions: {"generate": {"target": "generated", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "schedule": {"target": "scheduled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "withhold": {"target": "withheld", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["result_batch_status"], "searchColumns": ["result_batch_code"], "sortColumns": ["created_at", "result_batch_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "result_batch_status", "facetValues": ["draft", "generated", "ranking", "ranked", "under_review", "approved", "scheduled", "published", "partially_published", "withheld", "correction_pending", "corrected", "superseded", "archived"]},
  createSchema,
});
