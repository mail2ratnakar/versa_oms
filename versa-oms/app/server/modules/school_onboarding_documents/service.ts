import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "onboarding_case_id": z.string().uuid(),
    "document_type": z.string(),
    "document_file": z.string().uuid(),
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
  moduleId: "school_onboarding_documents",
  table: "school_onboarding_documents",
  scope: "staff",
  statusColumn: "review_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "sales_school_outreach_executive", "school_onboarding_executive", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "operations_head", "school_onboarding_executive", "super_admin"]},
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": false, "dualApproval": false}, "accept": {"target": "accepted", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["review_status", "document_type"], "sortColumns": ["created_at", "review_status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "review_status", "facetValues": ["uploaded", "under_review", "accepted", "rejected", "archived"]},
  createSchema,
});
