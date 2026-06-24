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
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "retire": {"target": "retired", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["report_status", "report_category", "classification"], "searchColumns": ["report_code", "report_name"], "sortColumns": ["created_at", "report_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "report_status", "facetValues": ["draft", "under_review", "active", "retired", "archived"]},
  createSchema,
});
