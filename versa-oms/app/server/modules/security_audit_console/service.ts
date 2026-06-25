import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "source_module": z.string(),
    "event_type": z.string(),
    "entity_type": z.string(),
    "action": z.string(),
    "event_hash": z.string(),
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
  moduleId: "security_audit_console",
  table: "security_audit_events",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"], "write": ["security_admin_reviewer", "super_admin", "support_manager"], "approve": ["company_admin", "super_admin"], "export": ["company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {},
  codeColumn: "audit_event_code",
  codePrefix: "AUDITE",
  listConfig: {"searchColumns": ["audit_event_code"], "sortColumns": ["created_at"], "defaultSort": {"column": "created_at", "ascending": false}},
  createSchema,
});
