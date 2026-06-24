import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "provider": z.string(),
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
  moduleId: "finance_ops_reconciliations",
  table: "finance_reconciliation_batches",
  scope: "staff",
  statusColumn: "reconciliation_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "finance_executive", "operations_head", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "finance_admin", "finance_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "finance_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["reconciliation_status", "provider"], "searchColumns": ["reconciliation_code"], "sortColumns": ["created_at", "reconciliation_status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "reconciliation_status", "facetValues": ["not_started", "matched", "partially_matched", "mismatch", "exception", "closed"]},
  createSchema,
});
