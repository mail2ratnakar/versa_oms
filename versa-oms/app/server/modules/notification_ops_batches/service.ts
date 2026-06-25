import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "batch_type": z.string(),
    "template_id": z.string().uuid(),
    "recipient_scope_snapshot": z.any(),
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
  moduleId: "notification_ops_batches",
  table: "notification_batches",
  scope: "staff",
  statusColumn: "batch_status",
  policy: {"read": ["auditor_read_only_reviewer", "communications_manager", "company_admin", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["communications_manager", "company_admin", "school_coordinator", "super_admin", "support_executive"], "approve": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["communications_manager", "company_admin", "security_admin_reviewer", "super_admin"]},
  transitions: {"start_review": {"target": "under_review", "klass": "write", "reasonRequired": true, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  codeColumn: "batch_code",
  codePrefix: "BATCH",
  listConfig: {"filterColumns": ["batch_status", "batch_type", "priority"], "searchColumns": ["batch_code"], "sortColumns": ["created_at", "batch_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "batch_status", "facetValues": ["draft", "dry_run", "under_review", "approved", "queued", "sending", "sent", "partially_failed", "failed", "cancelled", "archived"]},
  createSchema,
});
