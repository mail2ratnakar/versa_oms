import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "participation_id": z.string().uuid(),
    "school_id": z.string().uuid(),
    "expected_amount": z.coerce.number(),
    "manual_evidence_file": z.string().uuid(),
    "reversal_reason": z.string(),
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
  moduleId: "core_payments",
  table: "payments",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["finance_admin", "operations_staff", "sales_staff", "school_coordinator", "system_admin"], "write": ["finance_admin", "school_coordinator", "system_admin"], "export": ["finance_admin"]},
  transitions: {},
  codeColumn: "payment_code",
  codePrefix: "PAYMEN",
  listConfig: {"filterColumns": ["status", "provider"], "searchColumns": ["payment_code", "payment_reference"], "sortColumns": ["status"], "facetColumn": "status"},
  createSchema,
});
