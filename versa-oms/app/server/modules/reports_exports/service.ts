import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "report_name": z.string(),
    "report_category": z.string(),
    "source_modules": z.any(),
    "filter_schema": z.any(),
    "column_schema": z.any(),
    "report_version": z.string(),
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
  moduleId: "reports_exports",
  table: "report_definitions",
  scope: "staff",
  statusColumn: "report_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "communications_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_manager"], "write": ["analytics_owner", "certificate_manager", "communications_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "super_admin", "support_manager"], "approve": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["analytics_owner", "certificate_manager", "communications_manager", "company_admin", "evaluation_manager", "finance_admin", "operations_head", "results_approver", "security_admin_reviewer", "super_admin", "support_manager"], "download": ["company_admin", "finance_admin", "operations_head", "school_coordinator", "security_admin_reviewer"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  createSchema,
});
