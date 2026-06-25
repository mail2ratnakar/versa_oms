import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "assignment_id": z.string().uuid(),
    "from_slot_id": z.string().uuid(),
    "to_slot_id": z.string().uuid(),
    "reason": z.string(),
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
  moduleId: "exam_slot_ops_reschedules",
  table: "exam_slot_reschedule_requests",
  scope: "staff",
  statusColumn: "reschedule_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "exam_material_manager", "exam_operations_manager", "finance_admin", "operations_executive", "operations_head", "school_onboarding_executive", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "exam_operations_manager", "operations_executive", "operations_head", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "exam_operations_manager", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": false, "dualApproval": false}, "start_review": {"target": "under_review", "klass": "write", "reasonRequired": false, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "apply": {"target": "applied", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "reschedule_code",
  codePrefix: "RESCHE",
  listConfig: {"filterColumns": ["reschedule_status"], "searchColumns": ["reschedule_code"], "sortColumns": ["created_at", "reschedule_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "reschedule_status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "applied", "cancelled", "archived"]},
  createSchema,
});
