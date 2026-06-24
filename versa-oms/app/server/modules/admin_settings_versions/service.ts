import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "setting_key": z.string(),
    "setting_version": z.string(),
    "setting_value": z.any(),
    "value_hash": z.string(),
    "requested_by": z.string().uuid(),
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
  moduleId: "admin_settings_versions",
  table: "setting_versions",
  scope: "staff",
  statusColumn: "version_status",
  policy: {"read": ["auditor_read_only_reviewer", "certificate_manager", "communications_manager", "company_admin", "exam_operations_manager", "finance_admin", "operations_head", "security_admin_reviewer", "super_admin"], "write": ["certificate_manager", "communications_manager", "company_admin", "exam_operations_manager", "finance_admin", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "finance_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["security_admin_reviewer", "super_admin"]},
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "schedule": {"target": "scheduled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "supersede": {"target": "superseded", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["version_status"], "sortColumns": ["created_at", "version_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "version_status", "facetValues": ["draft", "under_review", "approved", "scheduled", "active", "superseded", "rolled_back", "rejected", "archived"]},
  createSchema,
});
