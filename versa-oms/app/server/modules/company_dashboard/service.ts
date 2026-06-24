import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "dashboard_view": z.string(),
    "layout_config": z.any(),
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
  moduleId: "company_dashboard",
  table: "dashboard_preferences",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "security_admin", "super_admin", "support_executive"], "write": ["company_admin", "evaluation_manager", "finance_admin", "operations_head", "security_admin", "super_admin", "support_executive"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"sortColumns": ["created_at", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}},
  createSchema,
});
