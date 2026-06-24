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
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "school-exam-slot-assignments", "label": "School Exam Slot Assignments", "subPath": "school-exam-slot-assignments", "listColumns": ["assignment_status", "assignment_code", "confirmed_student_count", "assignment_source"]}]}
      toolbar={{"facet": {"key": "cycle_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "published", "label": "Published"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
