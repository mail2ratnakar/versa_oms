import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "ticket_id": z.string().uuid(),
    "escalation_level": z.string(),
    "reason": z.string(),
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
  moduleId: "support_tickets_escalations",
  table: "support_ticket_escalations",
  scope: "staff",
  statusColumn: "escalation_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "module_owner", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive", "support_manager"], "write": ["company_admin", "finance_admin", "module_owner", "operations_head", "school_coordinator", "super_admin", "support_executive", "support_manager"], "approve": ["auditor_read_only_reviewer", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"]},
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": false, "dualApproval": false}, "resolve": {"target": "resolved", "klass": "write", "reasonRequired": false, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "escalation_code",
  codePrefix: "ESCALA",
  listConfig: {"filterColumns": ["escalation_status", "escalation_level"], "searchColumns": ["escalation_code"], "sortColumns": ["created_at", "escalation_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "escalation_status", "facetValues": ["open", "under_review", "resolved", "rejected", "closed", "archived"]},
  createSchema,
});
