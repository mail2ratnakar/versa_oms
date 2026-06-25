import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "participation_id": z.string().uuid(),
    "source_type": z.string(),
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord, transitionModuleRecord, getTransition, getModuleRecord } = defineModuleService({
  moduleId: "school_roster",
  table: "student_roster_batches",
  scope: "school",
  statusColumn: "batch_status",
  codeColumn: "batch_code",
  codePrefix: "ROST",
  initialStatus: "uploaded",
  policy: {},
  transitions: {"submit": {"target": "submitted_for_lock", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
