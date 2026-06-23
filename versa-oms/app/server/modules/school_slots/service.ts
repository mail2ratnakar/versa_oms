import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord, transitionModuleRecord, getTransition } = defineModuleService({
  moduleId: "school_slots",
  table: "school_exam_slot_assignments",
  scope: "school",
  statusColumn: "assignment_status",
  policy: {},
  transitions: {"confirm": {"target": "confirmed", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
