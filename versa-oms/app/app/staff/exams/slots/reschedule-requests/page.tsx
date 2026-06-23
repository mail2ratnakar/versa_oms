import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reschedule Requests"
      eyebrow="staff \u00b7 exam_slot_ops_reschedules"
      endpoint="/api/staff/exams/slots/reschedule-requests"
      columns={[{"key": "reschedule_code", "label": "reschedule code"}, {"key": "reason", "label": "reason"}, {"key": "capacity_impact", "label": "capacity impact"}, {"key": "material_impact", "label": "material impact"}, {"key": "reschedule_status", "label": "Status"}]}
      statusKey="reschedule_status"
      moduleId="exam_slot_ops_reschedules"
      createFields={[{ key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
