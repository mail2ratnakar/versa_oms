import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Slots"
      eyebrow="staff \u00b7 exam_slot_ops"
      endpoint="/api/staff/exams/slots"
      columns={[{"key": "cycle_code", "label": "Cycle Code"}, {"key": "cycle_name", "label": "Cycle Name"}, {"key": "olympiad_code", "label": "Olympiad Code"}, {"key": "subject_code", "label": "Subject Code"}, {"key": "cycle_status", "label": "Status"}]}
      statusKey="cycle_status"
      moduleId="exam_slot_ops"
      createFields={[{ key: "cycle_name", label: "Cycle Name" }, { key: "exam_window_start_at", label: "Exam Window Start At" }, { key: "exam_window_end_at", label: "Exam Window End At" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
