import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "cycle_name": z.string(),
    "exam_window_start_at": z.string(),
    "exam_window_end_at": z.string(),
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
  moduleId: "exam_slot_ops",
  table: "exam_cycles",
  scope: "staff",
  statusColumn: "cycle_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "exam_material_manager", "exam_operations_manager", "finance_admin", "operations_executive", "operations_head", "school_onboarding_executive", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "exam_operations_manager", "operations_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "exam_operations_manager", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["cycle_status"], "searchColumns": ["cycle_code", "cycle_name", "olympiad_code", "subject_code"], "sortColumns": ["created_at", "cycle_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "cycle_status", "facetValues": ["draft", "under_review", "approved", "published", "closed", "archived"]},
  createSchema,
});
