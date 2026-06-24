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
  moduleId: "courier_ops_shipments",
  table: "courier_shipments",
  scope: "staff",
  statusColumn: "shipment_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"mark_in_transit": {"target": "in_transit", "klass": "write", "reasonRequired": false, "dualApproval": false}, "deliver": {"target": "delivered", "klass": "write", "reasonRequired": false, "dualApproval": false}, "receive": {"target": "received", "klass": "write", "reasonRequired": false, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["shipment_status"], "searchColumns": ["code", "awb_number"], "sortColumns": ["created_at", "shipment_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "shipment_status", "facetValues": ["draft", "ready", "booked", "picked_up", "in_transit", "delivered", "receipt_pending", "received", "mismatch", "lost", "damaged", "cancelled", "closed", "archived"]},
  createSchema,
});
