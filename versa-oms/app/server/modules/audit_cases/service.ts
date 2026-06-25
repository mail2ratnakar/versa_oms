import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "case_type": z.string(),
    "title": z.string(),
    "related_event_ids": z.any(),
    "source_modules": z.any(),
    "risk_level": z.string(),
    "opened_at": z.string(),
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
  moduleId: "audit_cases",
  table: "audit_cases",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["operations_admin", "security_admin", "system_admin"], "write": ["operations_admin", "security_admin", "system_admin"], "export": ["security_admin"]},
  transitions: {"resolve": {"target": "resolved", "klass": "write", "reasonRequired": false, "dualApproval": false}, "close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "reopen": {"target": "reopened", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "case_code",
  codePrefix: "CASE",
  listConfig: {"filterColumns": ["status", "case_type", "risk_level"], "searchColumns": ["case_code", "title"], "sortColumns": ["created_at", "status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "status", "facetValues": ["open", "in_review", "waiting_for_input", "resolved", "closed", "reopened", "archived"], "ownerColumn": "assigned_to"},
  createSchema,
});
