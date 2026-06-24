import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "participation_id": z.string().uuid(),
    "exam_slot_id": z.string().uuid(),
    "confirmed_student_count": z.coerce.number().int(),
    "payment_status_at_booking": z.string(),
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord, transitionModuleRecord, getTransition } = defineModuleService({
  moduleId: "school_bookings",
  table: "exam_slot_bookings",
  scope: "school",
  statusColumn: "status",
  codeColumn: "booking_code",
  codePrefix: "BOOK",
  initialStatus: "confirmed",
  policy: {},
  transitions: {"cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
