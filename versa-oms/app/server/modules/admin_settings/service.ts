import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "group_name": z.string(),
    "owner_module": z.string(),
    "owner_role": z.string(),
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
  moduleId: "admin_settings",
  table: "setting_groups",
  scope: "staff",
  statusColumn: "group_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "communications_manager", "company_admin", "exam_operations_manager", "finance_admin", "operations_head", "security_admin_reviewer", "super_admin"], "write": ["certificate_manager", "communications_manager", "company_admin", "exam_operations_manager", "finance_admin", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["security_admin_reviewer", "super_admin"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "group_code",
  codePrefix: "GROUP",
  listConfig: {"filterColumns": ["group_status", "classification"], "searchColumns": ["group_code", "group_name"], "sortColumns": ["created_at", "group_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "group_status", "facetValues": ["active", "inactive", "archived"]},
  createSchema,
});
