import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "trace_id": z.string(),
    "actor_role": z.string(),
    "action": z.string(),
    "entity_name": z.string(),
    "entity_id": z.string(),
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
  moduleId: "audit_events_review",
  table: "audit_events",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["operations_admin", "security_admin", "system_admin"], "write": ["operations_admin", "security_admin", "system_admin"], "export": ["security_admin"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
