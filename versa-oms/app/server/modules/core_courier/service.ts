import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "participation_id": z.string().uuid(),
    "courier_company": z.string(),
    "awb_number": z.string(),
    "dispatch_date": z.string(),
    "sheets_expected": z.coerce.number().int(),
    "sheets_dispatched": z.coerce.number().int(),
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
  moduleId: "core_courier",
  table: "courier_batches",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["evaluator", "operations_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "school_coordinator", "system_admin"], "export": ["operations_staff"]},
  transitions: {"dispatch": {"target": "dispatched", "klass": "write", "reasonRequired": false, "dualApproval": false}, "mark_in_transit": {"target": "in_transit", "klass": "write", "reasonRequired": false, "dualApproval": false}, "deliver": {"target": "delivered", "klass": "write", "reasonRequired": false, "dualApproval": false}, "receive": {"target": "received", "klass": "write", "reasonRequired": false, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "batch_code",
  codePrefix: "BATCH",
  listConfig: {"filterColumns": ["status", "seal_condition"], "searchColumns": ["batch_code", "awb_number"], "sortColumns": ["status"], "facetColumn": "status"},
  createSchema,
});
