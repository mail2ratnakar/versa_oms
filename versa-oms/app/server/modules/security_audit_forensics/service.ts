import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "case_title": z.string(),
    "case_owner_id": z.string().uuid(),
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
  moduleId: "security_audit_forensics",
  table: "forensics_cases",
  scope: "staff",
  statusColumn: "case_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"], "write": ["security_admin_reviewer", "super_admin", "support_manager"], "approve": ["company_admin", "super_admin"], "export": ["company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "case_code",
  codePrefix: "CASE",
  listConfig: {"filterColumns": ["case_status"], "searchColumns": ["case_code", "case_title"], "sortColumns": ["created_at", "case_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "case_status", "facetValues": ["open", "collecting_evidence", "analysis", "findings_ready", "closed", "archived"], "ownerColumn": "case_owner_id"},
  createSchema,
});
