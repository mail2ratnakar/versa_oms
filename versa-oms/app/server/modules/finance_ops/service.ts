import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "roster_batch_id": z.string().uuid(),
    "confirmed_student_count": z.coerce.number().int(),
    "price_per_student": z.coerce.number(),
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
  moduleId: "finance_ops",
  table: "finance_invoices",
  scope: "staff",
  statusColumn: "invoice_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "finance_executive", "operations_head", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "finance_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "finance_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"mark_paid": {"target": "paid", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["invoice_status"], "searchColumns": ["invoice_number"], "sortColumns": ["created_at", "invoice_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "invoice_status", "facetValues": ["draft", "issued", "partially_paid", "paid", "cancelled", "voided", "superseded"]},
  createSchema,
});
