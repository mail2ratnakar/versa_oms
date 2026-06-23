import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "participation_id": z.string().uuid(),
    "exam_slot_id": z.string().uuid(),
    "payment_status_at_booking": z.string(),
    "booked_by": z.string().uuid(),
    "booked_at": z.string(),
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
  moduleId: "exam_slots_bookings",
  table: "exam_slot_bookings",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["finance_staff", "operations_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "school_coordinator", "system_admin"], "export": ["operations_staff"]},
  transitions: {"confirm": {"target": "confirmed", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "lock": {"target": "locked", "klass": "approve", "reasonRequired": true, "dualApproval": false}},
  createSchema,
});
