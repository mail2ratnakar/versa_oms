import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "category_name": z.string(),
    "sla_minutes": z.coerce.number().int(),
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
  moduleId: "support_tickets",
  table: "support_ticket_categories",
  scope: "staff",
  statusColumn: "category_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "module_owner", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive", "support_manager"], "write": ["company_admin", "finance_admin", "module_owner", "operations_head", "school_coordinator", "super_admin", "support_executive", "support_manager"], "approve": ["auditor_read_only_reviewer", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
