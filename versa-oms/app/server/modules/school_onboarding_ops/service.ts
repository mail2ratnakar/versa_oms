import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "source_type": z.string(),
    "school_name": z.string(),
    "normalized_school_name": z.string(),
    "address": z.string(),
    "city": z.string(),
    "state": z.string(),
    "coordinator_name": z.string(),
    "coordinator_email": z.string(),
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
  moduleId: "school_onboarding_ops",
  table: "school_onboarding_cases",
  scope: "staff",
  statusColumn: "onboarding_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "sales_school_outreach_executive", "school_onboarding_executive", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["auditor_read_only_reviewer", "company_admin", "operations_head", "sales_school_outreach_executive", "school_onboarding_executive", "security_admin_reviewer", "super_admin", "support_executive"], "approve": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  // NOTE: hand-maintained — "activate" added for CHAIN-002 (approved -> activated). Skipped in gen_modules.
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": false, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "activate": {"target": "activated", "klass": "approve", "reasonRequired": false, "dualApproval": false}, "block": {"target": "blocked", "klass": "write", "reasonRequired": false, "dualApproval": false}, "suspend": {"target": "suspended", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
