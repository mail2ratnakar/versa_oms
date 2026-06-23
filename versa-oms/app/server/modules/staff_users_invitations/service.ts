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
  transitions: {"cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
