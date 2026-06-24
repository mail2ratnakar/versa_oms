import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "payment_reference": z.string(),
    "invoice_id": z.string().uuid(),
    "school_id": z.string().uuid(),
    "provider": z.string(),
    "amount": z.coerce.number(),
    "currency": z.string(),
    "confirmation_source": z.string(),
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
  moduleId: "finance_ops_payments",
  table: "finance_payments",
  scope: "staff",
  statusColumn: "payment_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "finance_executive", "operations_head", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "finance_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "finance_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"confirm": {"target": "confirmed", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reverse": {"target": "reversed", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "refund": {"target": "refunded", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["payment_status", "provider", "confirmation_source"], "searchColumns": ["payment_reference", "manual_reference"], "sortColumns": ["created_at", "payment_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "payment_status", "facetValues": ["pending", "confirmed", "failed", "reversed", "refunded", "partially_refunded", "cancelled"]},
  createSchema,
});
