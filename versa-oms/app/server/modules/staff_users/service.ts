import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "full_name": z.string(),
    "email": z.string(),
    "department": z.string(),
    "primary_role": z.string(),
    "employment_type": z.string(),
    "joining_date": z.string(),
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
  moduleId: "staff_users",
  table: "staff_profiles",
  scope: "staff",
  statusColumn: "staff_status",
  policy: {"read": ["auditor_read_only", "company_admin", "department_manager", "operations_head", "security_admin", "staff_user", "super_admin"], "write": ["company_admin", "operations_head", "security_admin", "staff_user", "super_admin"]},
  transitions: {"suspend": {"target": "suspended", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
