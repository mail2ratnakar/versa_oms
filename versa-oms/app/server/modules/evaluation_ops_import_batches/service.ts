import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "exam_cycle_id": z.string().uuid(),
    "source_type": z.string(),
    "uploaded_by": z.string().uuid(),
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
  moduleId: "evaluation_ops_import_batches",
  table: "evaluation_import_batches",
  scope: "staff",
  statusColumn: "batch_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "omr_import_operator", "operations_head", "results_approver", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "evaluation_manager", "omr_import_operator", "question_paper_content_manager", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "evaluation_manager", "security_admin_reviewer", "super_admin"]},
  transitions: {"validate": {"target": "validated", "klass": "write", "reasonRequired": true, "dualApproval": false}, "start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve_for_results": {"target": "approved_for_results", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["batch_status", "source_type"], "searchColumns": ["import_batch_code"], "sortColumns": ["created_at", "batch_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "batch_status", "facetValues": ["draft", "uploaded", "validating", "validation_failed", "validated", "scoring", "scored", "under_review", "approved_for_results", "rejected", "archived"]},
  createSchema,
});
