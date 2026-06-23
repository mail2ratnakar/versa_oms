import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "exception_type": z.string(),
    "severity": z.string(),
    "description": z.string(),
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
  moduleId: "evaluation_ops_exceptions",
  table: "evaluation_exceptions",
  scope: "staff",
  statusColumn: "exception_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "omr_import_operator", "operations_head", "results_approver", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "evaluation_manager", "omr_import_operator", "question_paper_content_manager", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "evaluation_manager", "security_admin_reviewer", "super_admin"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  createSchema,
});
