import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "email": z.string(),
    "full_name": z.string(),
    "department": z.string(),
    "primary_role": z.string(),
    "invitation_token_hash": z.string(),
    "expires_at": z.string(),
    "invited_by": z.string().uuid(),
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
  moduleId: "staff_users_invitations",
  table: "staff_invitations",
  scope: "staff",
  statusColumn: "invitation_status",
  policy: {"read": ["auditor_read_only", "company_admin", "operations_head", "security_admin", "super_admin"], "write": ["company_admin", "security_admin", "super_admin"]},
  transitions: {"accept": {"target": "accepted", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  codeColumn: "invitation_code",
  codePrefix: "INVITA",
  listConfig: {"filterColumns": ["invitation_status"], "searchColumns": ["invitation_code", "email", "full_name"], "sortColumns": ["created_at", "invitation_status"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "invitation_status", "facetValues": ["pending", "accepted", "expired", "cancelled", "resent"]},
  createSchema,
});
