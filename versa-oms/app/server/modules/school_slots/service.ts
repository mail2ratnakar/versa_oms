import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord } = defineModuleService({
  moduleId: "school_slots",
  table: "school_exam_slot_assignments",
  scope: "school",
  policy: {},
  createSchema,
});
