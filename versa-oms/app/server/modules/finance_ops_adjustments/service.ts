import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "invoice_id": z.string().uuid(),
    "school_id": z.string().uuid(),
    "adjustment_type": z.string(),
    "amount": z.coerce.number(),
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
  moduleId: "finance_ops_adjustments",
  table: "finance_adjustments",
  scope: "staff",
  statusColumn: "adjustment_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "finance_executive", "operations_head", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "finance_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "finance_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["adjustment_status", "adjustment_type"], "searchColumns": ["adjustment_code"], "sortColumns": ["created_at", "adjustment_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "adjustment_status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "applied", "cancelled", "archived"]},
  createSchema,
});
