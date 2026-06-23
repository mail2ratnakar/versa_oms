import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord } = defineModuleService({
  moduleId: "school_materials",
  table: "exam_material_packages",
  scope: "school",
  policy: {},
  createSchema,
});
