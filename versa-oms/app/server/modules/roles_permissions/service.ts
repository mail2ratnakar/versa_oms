import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "role_id": z.string(),
    "role_name": z.string(),
    "department": z.string(),
    "risk_level": z.string(),
    "scope_model": z.string(),
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
  moduleId: "roles_permissions",
  table: "portal_roles",
  scope: "staff",
  statusColumn: "role_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "staff_user", "super_admin"], "write": ["company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["role_status", "risk_level"], "searchColumns": ["role_name"], "sortColumns": ["created_at", "role_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "role_status", "facetValues": ["draft", "active", "deprecated", "disabled", "archived"]},
  createSchema,
});
