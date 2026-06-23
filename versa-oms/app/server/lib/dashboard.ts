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

export async function getStaffKpis(): Promise<Kpi[]> {
  return Promise.all(STAFF.map(async (k) => ({ key: k.key, label: k.label, value: await countOf(k.table), tone: k.tone })));
}

export async function getSchoolKpis(schoolId: string): Promise<Kpi[]> {
  return Promise.all(SCHOOL.map(async (k) => ({ key: k.key, label: k.label, value: await countOf(k.table, schoolId), tone: k.tone })));
}
