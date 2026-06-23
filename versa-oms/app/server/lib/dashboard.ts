import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Kpi = { key: string; label: string; value: number; tone: "default" | "blue" | "green" | "yellow" | "red" };

async function countOf(table: string, schoolId?: string): Promise<number> {
  try {
    const supabase = createSupabaseAdminClient();
    let q = supabase.from(table).select("*", { count: "exact", head: true }).is("archived_at", null);
    if (schoolId) q = q.eq("school_id", schoolId);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

const STAFF: Array<{ key: string; label: string; table: string; tone: Kpi["tone"] }> = [
  { key: "schools", label: "Schools", table: "schools", tone: "blue" },
  { key: "onboarding", label: "Onboarding cases", table: "school_onboarding_cases", tone: "yellow" },
  { key: "students", label: "Students", table: "students", tone: "blue" },
  { key: "participations", label: "Participations", table: "participations", tone: "default" },
  { key: "payments", label: "Payments", table: "payments", tone: "green" },
  { key: "slots", label: "Exam slots", table: "exam_slots", tone: "default" },
  { key: "results", label: "Result batches", table: "result_batches", tone: "default" },
  { key: "certificates", label: "Certificates", table: "certificates", tone: "green" },
  { key: "tickets", label: "Support tickets", table: "support_tickets", tone: "yellow" },
  { key: "audit", label: "Audit events", table: "audit_events", tone: "red" },
];

const SCHOOL: Array<{ key: string; label: string; table: string; tone: Kpi["tone"] }> = [
  { key: "students", label: "Students", table: "students", tone: "blue" },
  { key: "payments", label: "Payments", table: "payments", tone: "green" },
  { key: "results", label: "Results", table: "candidate_results", tone: "default" },
  { key: "certificates", label: "Certificates", table: "certificates", tone: "green" },
  { key: "materials", label: "Materials", table: "exam_material_packages", tone: "yellow" },
  { key: "slots", label: "Exam slots", table: "school_exam_slot_assignments", tone: "default" },
];

// Role-aware KPI selection: each non-admin role sees its slice; admins see all.
const ROLE_KPIS: Record<string, string[]> = {
  finance_admin: ["schools", "payments", "certificates"],
  finance_executive: ["schools", "payments"],
  evaluation_manager: ["results", "certificates"],
  results_approver: ["results", "certificates"],
  support_executive: ["tickets"],
  support_manager: ["tickets"],
  sales_outreach_executive: ["schools"],
};
const GLOBAL = ["super_admin", "system_admin", "company_admin", "operations_head", "auditor_read_only_reviewer", "security_admin_reviewer"];

export async function getStaffKpis(roles: string[] = []): Promise<Kpi[]> {
  let defs = STAFF;
  if (roles.length && !roles.some((r) => GLOBAL.includes(r))) {
    const allowed = new Set(roles.flatMap((r) => ROLE_KPIS[r] ?? []));
    if (allowed.size) defs = STAFF.filter((k) => allowed.has(k.key));
  }
  return Promise.all(defs.map(async (k) => ({ key: k.key, label: k.label, value: await countOf(k.table), tone: k.tone })));
}

export async function getSchoolKpis(schoolId: string): Promise<Kpi[]> {
  return Promise.all(SCHOOL.map(async (k) => ({ key: k.key, label: k.label, value: await countOf(k.table, schoolId), tone: k.tone })));
}
