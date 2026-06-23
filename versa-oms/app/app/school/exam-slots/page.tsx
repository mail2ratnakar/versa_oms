import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Slots"
      eyebrow="school \u00b7 school_slots"
      endpoint="/api/school/exam-slots"
      columns={[{"key": "assignment_code", "label": "assignment code"}, {"key": "assignment_source", "label": "assignment source"}, {"key": "payment_gate_status", "label": "payment gate status"}, {"key": "roster_gate_status", "label": "roster gate status"}, {"key": "assignment_status", "label": "Status"}]}
      statusKey="assignment_status"
      moduleId="school_slots"
    />
  );
}
