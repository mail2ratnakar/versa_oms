import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "candidate_id": z.string(),
    "school_id": z.string().uuid(),
    "participation_id": z.string().uuid(),
    "student_name": z.string(),
    "grade": z.string(),
    "consent_obtained": z.coerce.boolean(),
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
  moduleId: "core_students",
  table: "students",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["evaluator", "finance_staff", "operations_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "school_coordinator", "system_admin"], "export": ["operations_staff", "school_coordinator"]},
  transitions: {},
  createSchema,
});
