import type { ResolvedActor } from "@/server/auth/resolveActor";

export type ModuleAction = "read" | "write" | "approve" | "export" | "download" | "admin";

const adminRoles = new Set(["super_admin", "company_admin"]);

const moduleRoleMap: Record<string, string[]> = {
  company_dashboard: ["super_admin", "company_admin", "operations_head", "operations_executive"],
  staff_users: ["super_admin", "company_admin"],
  roles_permissions: ["super_admin", "company_admin", "security_admin_reviewer"],
  school_crm: ["super_admin", "company_admin", "operations_head", "sales_school_outreach_executive"],
  school_onboarding_ops: ["super_admin", "company_admin", "operations_head", "school_onboarding_executive"],
  student_roster_ops: ["super_admin", "company_admin", "operations_head", "operations_executive"],
  finance_ops: ["super_admin", "company_admin", "finance_admin", "finance_executive"],
  exam_slot_ops: ["super_admin", "company_admin", "exam_operations_manager"],
  exam_material_ops: ["super_admin", "company_admin", "exam_operations_manager", "material_release_manager"],
  courier_ops: ["super_admin", "company_admin", "courier_logistics_manager"],
  evaluation_ops: ["super_admin", "company_admin", "evaluation_manager", "omr_import_operator"],
  results_ops: ["super_admin", "company_admin", "results_approver"],
  certificate_ops: ["super_admin", "company_admin", "certificate_manager"],
  notification_ops: ["super_admin", "company_admin", "communications_manager"],
  support_tickets: ["super_admin", "company_admin", "support_executive"],
  task_work_queue: ["super_admin", "company_admin", "operations_head", "operations_executive"],
  reports_exports: ["super_admin", "company_admin", "operations_head"],
  admin_settings: ["super_admin", "company_admin"],
  security_audit_console: ["super_admin", "company_admin", "security_admin_reviewer", "auditor_read_only_reviewer"]
};

export function canAccessModule(actor: ResolvedActor, moduleId: string, action: ModuleAction): boolean {
  if (actor.status !== "active" && actor.actor_type !== "system") return false;
  if (actor.roles.some((role) => adminRoles.has(role))) return true;

  const allowedRoles = moduleRoleMap[moduleId] ?? [];
  const hasRole = actor.roles.some((role) => allowedRoles.includes(role));
  if (!hasRole) return false;

  if (action === "admin") return actor.roles.some((role) => adminRoles.has(role));
  if (action === "approve") return actor.roles.some((role) => ["results_approver", "finance_admin", "security_admin_reviewer"].includes(role));
  return true;
}
