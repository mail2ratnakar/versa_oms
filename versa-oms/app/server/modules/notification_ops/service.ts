import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "channel": z.string(),
    "body_template": z.string(),
    "required_variables": z.any(),
    "allowed_recipient_roles": z.any(),
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
  moduleId: "notification_ops",
  table: "notification_templates",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "communications_manager", "company_admin", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["communications_manager", "company_admin", "school_coordinator", "super_admin", "support_executive"], "approve": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["communications_manager", "company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "retire": {"target": "retired", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "template_code",
  codePrefix: "TEMPLA",
  listConfig: {"filterColumns": ["status", "channel"], "searchColumns": ["template_code", "event_code"], "sortColumns": ["status"], "facetColumn": "status", "facetValues": ["draft", "approved", "active", "superseded", "archived"]},
  createSchema,
});
