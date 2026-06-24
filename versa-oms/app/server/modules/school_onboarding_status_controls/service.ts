import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "control_type": z.string(),
    "reason": z.string(),
    "applied_by": z.string().uuid(),
    "applied_at": z.string(),
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
  moduleId: "school_onboarding_status_controls",
  table: "school_status_controls",
  scope: "staff",
  statusColumn: "control_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "sales_school_outreach_executive", "school_onboarding_executive", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "approve": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"release": {"target": "released", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["control_status", "control_type"], "sortColumns": ["created_at", "control_status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "control_status", "facetValues": ["active", "released", "archived"]},
  createSchema,
});
