import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "code": z.string(),
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
  moduleId: "courier_ops_exceptions",
  table: "courier_exceptions",
  scope: "staff",
  statusColumn: "exception_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": false, "dualApproval": false}, "resolve": {"target": "resolved", "klass": "write", "reasonRequired": false, "dualApproval": false}, "escalate": {"target": "escalated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["exception_status"], "searchColumns": ["code", "awb_number"], "sortColumns": ["created_at", "exception_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "exception_status", "facetValues": ["open", "under_review", "awaiting_school", "awaiting_vendor", "resolved", "accepted_with_risk", "escalated", "closed", "archived"]},
  createSchema,
});
