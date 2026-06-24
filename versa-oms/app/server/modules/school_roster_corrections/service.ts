import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "roster_batch_id": z.string().uuid(),
    "correction_type": z.string(),
    "requested_change": z.any(),
    "reason": z.string(),
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord, transitionModuleRecord, getTransition } = defineModuleService({
  moduleId: "school_roster_corrections",
  table: "student_roster_corrections",
  scope: "school",
  statusColumn: "correction_status",
  codeColumn: "correction_code",
  codePrefix: "CORR",
  initialStatus: "draft",
  reasonIsColumn: true,
  policy: {},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
