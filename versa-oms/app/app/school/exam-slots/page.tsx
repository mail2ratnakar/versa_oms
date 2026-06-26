import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Slots"
      eyebrow="school \u00b7 school_slots"
      endpoint="/api/school/exam-slots"
      columns={[{"key": "assignment_code", "label": "Assignment"}, {"key": "assignment_source", "label": "Assignment Source"}, {"key": "payment_gate_status", "label": "Payment Gate Status"}, {"key": "roster_gate_status", "label": "Roster Gate Status"}, {"key": "assignment_status", "label": "Status"}]}
      description="Manage and review exam slots across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Exam Slots"}]}
      nextAction="\u2192 Open a record to move it through its workflow."
      statusKey="assignment_status"
      moduleId="school_slots"
      actions={[{"action": "confirm", "label": "Confirm", "variant": "blue"}]}
    />
  );
}
