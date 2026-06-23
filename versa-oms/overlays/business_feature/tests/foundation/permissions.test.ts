import assert from "node:assert";
import { canAccessModule } from "../../server/security/permissions";

const admin = {
  actor_id: "staff_001",
  actor_type: "staff",
  roles: ["super_admin"],
  scopes: ["global"],
  status: "active"
} as const;

const disabled = {
  actor_id: "staff_010",
  actor_type: "staff",
  roles: ["super_admin"],
  scopes: ["global"],
  status: "disabled"
} as const;

assert.equal(canAccessModule(admin, "finance_ops", "read"), true);
assert.equal(canAccessModule(disabled, "finance_ops", "read"), false);

console.log("permissions foundation tests passed");
