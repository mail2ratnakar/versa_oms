import type { Actor } from "@/server/types";
import maskingConfig from "@/config/masking.json";

type Rule = {
  field_pattern: string;
  classification: string;
  default_mask: string;
  unmask_roles: string[];
};
const RULES: Rule[] = (maskingConfig as { rules: Rule[] }).rules;

function maskLast4(v: unknown): string {
  const s = String(v ?? "");
  if (s.length <= 4) return "••••";
  return "••••" + s.slice(-4);
}
function maskPartialEmail(v: unknown): string {
  const s = String(v ?? "");
  const at = s.indexOf("@");
  if (at <= 0) return "•••";
  return s[0] + "•••" + s.slice(at);
}

function ruleFor(field: string): Rule | undefined {
  // exact match first, then substring pattern match
  return (
    RULES.find((r) => r.field_pattern === field) ||
    RULES.find((r) => field.includes(r.field_pattern))
  );
}

// Top platform-admin roles see everything (least surprise; they already hold every grant).
const ALWAYS_UNMASK = ["super_admin", "system_admin"];
function canUnmask(rule: Rule, actor: Actor): boolean {
  if (actor.roles.some((r) => ALWAYS_UNMASK.includes(r))) return true;
  if (rule.unmask_roles.includes("all_authorized")) {
    return actor.actor_type === "staff" || actor.actor_type === "school";
  }
  return actor.roles.some((r) => rule.unmask_roles.includes(r));
}

/** Apply the masking rule for a single field given the actor. Returns the safe value. */
export function maskValue(field: string, value: unknown, actor: Actor): unknown {
  const rule = ruleFor(field);
  if (!rule) return value;
  if (rule.default_mask === "visible") return value;
  if (canUnmask(rule, actor)) return value;

  switch (rule.default_mask) {
    case "last_4_only":
      return maskLast4(value);
    case "partial_email":
      return maskPartialEmail(value);
    case "hidden":
    case "never_return_raw":
    case "return_only_on_authorized_download":
      return null;
    case "hidden_from_school":
      return actor.actor_type === "school" ? null : value;
    case "masked_for_finance_default":
      return actor.roles.includes("finance_admin") || actor.roles.includes("finance_executive")
        ? null
        : value;
    default:
      return null;
  }
}

/** Mask every field of a record according to the actor's roles/type. */
export function maskRecord<T extends Record<string, unknown>>(record: T, actor: Actor): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    out[k] = maskValue(k, v, actor);
  }
  return out as T;
}

/** Mask a list of records. */
export function maskRecords<T extends Record<string, unknown>>(records: T[], actor: Actor): T[] {
  return records.map((r) => maskRecord(r, actor));
}
