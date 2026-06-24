import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "template_name": z.string(),
    "certificate_type": z.string(),
    "template_config": z.any(),
    "required_merge_fields": z.any(),
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
  moduleId: "certificate_ops",
  table: "certificate_templates",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "operations_head", "results_approver", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["certificate_manager", "company_admin", "super_admin"], "approve": ["auditor_read_only_reviewer", "certificate_manager", "company_admin", "operations_head", "results_approver", "security_admin_reviewer", "super_admin"], "export": ["certificate_manager", "company_admin", "security_admin_reviewer", "super_admin"], "download": ["school_coordinator"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "certificate_type"], "searchColumns": ["template_code", "template_name"], "sortColumns": ["status"], "facetColumn": "status", "facetValues": ["draft", "approved", "active", "superseded", "archived"]},
  createSchema,
});
