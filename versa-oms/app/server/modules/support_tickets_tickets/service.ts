import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "ticket_source": z.string(),
    "category_id": z.string().uuid(),
    "subject": z.string(),
    "description": z.string(),
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
  moduleId: "support_tickets_tickets",
  table: "support_tickets",
  scope: "staff",
  statusColumn: "ticket_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "module_owner", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive", "support_manager"], "write": ["company_admin", "finance_admin", "module_owner", "operations_head", "school_coordinator", "super_admin", "support_executive", "support_manager"], "approve": ["auditor_read_only_reviewer", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["ticket_status", "ticket_source", "priority"], "searchColumns": ["ticket_code", "resolution_code"], "sortColumns": ["created_at", "ticket_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "ticket_status", "facetValues": ["new", "open", "assigned", "waiting_on_school", "waiting_on_staff", "escalated", "resolved", "closed", "reopened", "archived"], "ownerColumn": "assigned_to"},
  createSchema,
});
