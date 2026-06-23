import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_name": z.string(),
    "normalized_school_name": z.string(),
    "city": z.string(),
    "state": z.string(),
    "lead_source": z.string(),
    "lead_owner_id": z.string().uuid(),
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
  moduleId: "school_crm",
  table: "school_leads",
  scope: "staff",
  statusColumn: "lead_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "sales_school_outreach_executive", "school_onboarding_executive", "super_admin", "support_executive"], "write": ["company_admin", "operations_head", "sales_school_outreach_executive", "school_onboarding_executive", "super_admin"], "export": ["company_admin", "operations_head", "super_admin"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
