import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Slots"
      eyebrow="school \u00b7 school_slots"
      endpoint="/api/school/exam-slots"
      columns={[{"key": "assignment_code", "label": "Assignment"}, {"key": "assignment_source", "label": "Assignment Source"}, {"key": "payment_gate_status", "label": "Payment Gate Status"}, {"key": "roster_gate_status", "label": "Roster Gate Status"}, {"key": "assignment_status", "label": "Status"}]}
      statusKey="assignment_status"
      moduleId="school_slots"
      actions={[{"action": "confirm", "label": "Confirm", "variant": "blue"}]}
    />
  );
}
