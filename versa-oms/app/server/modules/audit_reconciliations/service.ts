import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "recon_type": z.string(),
    "scope": z.any(),
    "run_started_at": z.string(),
    "recon_report": z.any(),
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
  moduleId: "audit_reconciliations",
  table: "reconciliation_runs",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["operations_admin", "security_admin", "system_admin"], "write": ["operations_admin", "security_admin", "system_admin"], "export": ["security_admin"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "recon_type"], "searchColumns": ["recon_code"], "sortColumns": ["created_at", "status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "status", "facetValues": ["running", "passed", "exceptions_found", "failed", "closed", "archived"]},
  createSchema,
});
