import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "import_batch_id": z.string().uuid(),
    "answer_key_id": z.string().uuid(),
    "score_formula_version": z.string(),
    "scoring_snapshot_hash": z.string(),
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
  moduleId: "evaluation_ops_score_batches",
  table: "evaluation_score_batches",
  scope: "staff",
  statusColumn: "score_batch_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "omr_import_operator", "operations_head", "results_approver", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "evaluation_manager", "omr_import_operator", "question_paper_content_manager", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "evaluation_manager", "security_admin_reviewer", "super_admin"]},
  transitions: {"approve_for_results": {"target": "approved_for_results", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "supersede": {"target": "superseded", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["score_batch_status"], "searchColumns": ["score_batch_code"], "sortColumns": ["created_at", "score_batch_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "score_batch_status", "facetValues": ["draft", "scoring", "scored", "under_review", "approved_for_results", "rejected", "superseded", "archived"]},
  createSchema,
});
