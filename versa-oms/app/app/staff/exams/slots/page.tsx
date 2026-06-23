import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Slots"
      eyebrow="staff \u00b7 exam_slot_ops"
      endpoint="/api/staff/exams/slots"
      columns={[{"key": "cycle_code", "label": "cycle code"}, {"key": "cycle_name", "label": "cycle name"}, {"key": "olympiad_code", "label": "olympiad code"}, {"key": "subject_code", "label": "subject code"}, {"key": "cycle_status", "label": "Status"}]}
      statusKey="cycle_status"
      moduleId="exam_slot_ops"
      createFields={[{ key: "cycle_name", label: "Cycle name" }, { key: "exam_window_start_at", label: "Exam window start at" }, { key: "exam_window_end_at", label: "Exam window end at" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
