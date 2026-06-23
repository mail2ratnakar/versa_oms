import type { Actor, ModuleAction } from "@/server/types";

/**
 * Server-side permission engine. Each module registers its role->action policy
 * when it is built (Phase D reads the module's permissions.json). can() is the
 * single decision point used by the guards. Default is DENY.
 *
 * Superuser roles bypass per-module checks (still audited). Everything else must
 * be explicitly granted for (module, action).
 */
export const SUPERUSER_ROLES = ["super_admin", "system_admin", "company_admin"];

export type ModulePolicy = Partial<Record<ModuleAction, string[]>>;

const registry = new Map<string, ModulePolicy>();

export function registerModulePolicy(moduleId: string, policy: ModulePolicy): void {
  registry.set(moduleId, policy);
}

export function getModulePolicy(moduleId: string): ModulePolicy | undefined {
  return registry.get(moduleId);
}

export function can(actor: Actor, moduleId: string, action: ModuleAction): boolean {
  if (!actor.roles || actor.roles.length === 0) return false;
  if (actor.roles.some((r) => SUPERUSER_ROLES.includes(r))) return true;
  const policy = registry.get(moduleId);
  if (!policy) return false;
  const allowed = policy[action];
  if (!allowed || allowed.length === 0) return false;
  if (allowed.includes("*") || allowed.includes("all_authorized")) return true;
  return actor.roles.some((r) => allowed.includes(r));
}
