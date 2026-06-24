import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "incident_type": z.string(),
    "severity": z.string(),
    "affected_modules": z.any(),
    "related_event_ids": z.any(),
    "summary": z.string(),
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
  moduleId: "security_audit_incidents",
  table: "security_incidents",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin", "support_manager"], "write": ["security_admin_reviewer", "super_admin", "support_manager"], "approve": ["company_admin", "super_admin"], "export": ["company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "incident_type", "severity"], "searchColumns": ["incident_code"], "sortColumns": ["created_at", "status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "status", "facetValues": ["open", "triaged", "contained", "remediated", "closed", "reopened", "archived"]},
  createSchema,
});
