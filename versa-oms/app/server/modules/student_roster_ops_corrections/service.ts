import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "roster_batch_id": z.string().uuid(),
    "correction_type": z.string(),
    "requested_change": z.any(),
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
  moduleId: "student_roster_ops_corrections",
  table: "student_roster_corrections",
  scope: "staff",
  statusColumn: "correction_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "finance_admin", "omr_import_operator", "operations_executive", "operations_head", "school_onboarding_executive", "super_admin", "support_executive"], "write": ["company_admin", "operations_executive", "operations_head", "school_onboarding_executive", "super_admin", "support_executive"], "approve": ["company_admin", "operations_head", "super_admin"], "export": ["company_admin", "operations_head", "super_admin"]},
  transitions: {"submit": {"target": "submitted", "klass": "write", "reasonRequired": false, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["correction_status", "correction_type"], "searchColumns": ["correction_code"], "sortColumns": ["created_at", "correction_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "correction_status", "facetValues": ["draft", "submitted", "under_review", "approved", "rejected", "applied", "cancelled", "archived"]},
  createSchema,
});
