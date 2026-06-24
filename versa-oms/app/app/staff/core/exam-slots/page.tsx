import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam slots (core)"
      eyebrow="staff \u00b7 core_exam_slots"
      endpoint="/api/staff/core/exam-slots"
      columns={[{"key": "slot_code", "label": "Slot Code"}, {"key": "exam_date", "label": "Exam Date"}, {"key": "start_time", "label": "Start Time"}, {"key": "end_time", "label": "End Time"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="exam_slots"
      createFields={[{ key: "exam_date", label: "Exam Date", type: "date" }, { key: "start_time", label: "Start Time" }, { key: "end_time", label: "End Time" }, { key: "capacity_schools", label: "Capacity Schools", type: "number" }, { key: "capacity_students", label: "Capacity Students", type: "number" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
