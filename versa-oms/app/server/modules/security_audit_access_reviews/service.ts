import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "scope": z.string(),
    "review_snapshot": z.any(),
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
  moduleId: "security_audit_access_reviews",
  table: "access_reviews",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"], "write": ["security_admin_reviewer", "super_admin", "support_manager"], "approve": ["company_admin", "super_admin"], "export": ["company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "review_code",
  codePrefix: "REVIEW",
  listConfig: {"filterColumns": ["status", "scope"], "searchColumns": ["review_code"], "sortColumns": ["created_at", "status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "status", "facetValues": ["open", "in_review", "approved", "exceptions_found", "closed", "archived"]},
  createSchema,
});
