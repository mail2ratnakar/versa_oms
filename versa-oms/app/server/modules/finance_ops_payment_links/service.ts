import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "invoice_id": z.string().uuid(),
    "school_id": z.string().uuid(),
    "provider": z.string(),
    "amount": z.coerce.number(),
    "currency": z.string(),
    "expires_at": z.string(),
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
  moduleId: "finance_ops_payment_links",
  table: "finance_payment_links",
  scope: "staff",
  statusColumn: "link_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "finance_executive", "operations_head", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "finance_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "finance_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"mark_paid": {"target": "paid", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  createSchema,
});
