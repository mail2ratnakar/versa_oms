import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "student_name": z.string().min(1),
    "grade": z.string().min(1),
    "consent_obtained": z.coerce.boolean(),
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord } = defineModuleService({
  moduleId: "school_students",
  table: "students",
  scope: "school",
  policy: {},
  createSchema,
});
