import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord } = defineModuleService({
  moduleId: "school_results",
  table: "candidate_results",
  scope: "school",
  policy: {},
  createSchema,
});
