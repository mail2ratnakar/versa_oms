import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "staff_profile_id": z.string().uuid(),
    "scope_type": z.string(),
    "scope_value": z.string(),
    "assigned_by": z.string().uuid(),
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
  moduleId: "staff_users_assignment_scopes",
  table: "staff_assignment_scopes",
  scope: "staff",
  statusColumn: "scope_status",
  policy: {"read": ["auditor_read_only", "company_admin", "department_manager", "operations_head", "security_admin", "staff_user", "super_admin"], "write": ["company_admin", "operations_head", "security_admin", "super_admin"]},
  transitions: {"revoke": {"target": "revoked", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["scope_status", "scope_type"], "sortColumns": ["created_at", "scope_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "scope_status", "facetValues": ["active", "paused", "expired", "revoked", "archived"]},
  createSchema,
});
