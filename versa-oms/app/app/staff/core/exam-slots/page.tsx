import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam slots (core)"
      eyebrow="staff \u00b7 core_exam_slots"
      endpoint="/api/staff/core/exam-slots"
      columns={[{"key": "slot_code", "label": "slot code"}, {"key": "exam_date", "label": "exam date"}, {"key": "start_time", "label": "start time"}, {"key": "end_time", "label": "end time"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "exam_date", label: "Exam date", type: "date" }, { key: "start_time", label: "Start time" }, { key: "end_time", label: "End time" }, { key: "capacity_schools", label: "Capacity schools", type: "number" }, { key: "capacity_students", label: "Capacity students", type: "number" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
