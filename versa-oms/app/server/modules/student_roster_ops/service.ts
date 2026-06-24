import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "source_type": z.string(),
    "uploaded_by": z.string().uuid(),
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
  moduleId: "student_roster_ops",
  table: "student_roster_batches",
  scope: "staff",
  statusColumn: "batch_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "evaluation_manager", "finance_admin", "omr_import_operator", "operations_executive", "operations_head", "school_onboarding_executive", "super_admin", "support_executive"], "write": ["company_admin", "operations_executive", "operations_head", "school_onboarding_executive", "super_admin", "support_executive"], "approve": ["company_admin", "operations_head", "super_admin"], "export": ["company_admin", "operations_head", "super_admin"]},
  transitions: {"validate": {"target": "validated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "submit_for_lock": {"target": "submitted_for_lock", "klass": "write", "reasonRequired": false, "dualApproval": false}, "lock": {"target": "locked", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "supersede": {"target": "superseded", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["batch_status", "source_type"], "searchColumns": ["batch_code"], "sortColumns": ["created_at", "batch_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "batch_status", "facetValues": ["uploaded", "validating", "validation_failed", "validated", "submitted_for_lock", "locked", "unlock_requested", "correction_pending", "superseded", "archived"]},
  createSchema,
});
