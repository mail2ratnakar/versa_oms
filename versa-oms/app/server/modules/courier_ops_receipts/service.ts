import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
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
  moduleId: "courier_ops_receipts",
  table: "courier_receipts",
  scope: "staff",
  statusColumn: "receipt_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": false, "dualApproval": false}, "confirm": {"target": "confirmed", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "code",
  codePrefix: "CR",
  listConfig: {"filterColumns": ["receipt_status"], "searchColumns": ["code", "awb_number"], "sortColumns": ["created_at", "receipt_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "receipt_status", "facetValues": ["draft", "submitted", "confirmed", "mismatch", "rejected", "closed", "archived"]},
  createSchema,
});
