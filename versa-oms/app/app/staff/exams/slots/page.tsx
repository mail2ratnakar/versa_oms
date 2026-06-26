import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Slots"
      eyebrow="staff \u00b7 exam_slot_ops"
      endpoint="/api/staff/exams/slots"
      columns={[{"key": "cycle_code", "label": "Cycle"}, {"key": "cycle_name", "label": "Cycle Name"}, {"key": "olympiad_code", "label": "Olympiad"}, {"key": "subject_code", "label": "Subject"}, {"key": "cycle_status", "label": "Status"}]}
      description="Schedule and assign exam slots within seat and school capacity."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Exams", "href": "/staff/exams"}, {"label": "Slots"}]}
      nextAction="\u2192 Use \u201cNew Exam Slot\u201d to add one, then act on it from the list."
      statusKey="cycle_status"
      moduleId="exam_slot_ops"
      createFields={[{"key": "cycle_name", "label": "Cycle Name", "type": "text"}, {"key": "olympiad_code", "label": "Olympiad", "type": "text"}, {"key": "subject_code", "label": "Subject", "type": "text"}, {"key": "grade_range", "label": "Grade Range", "type": "text"}, {"key": "registration_start_at", "label": "Registration Start At", "type": "date"}, {"key": "registration_end_at", "label": "Registration End At", "type": "date"}, {"key": "exam_window_start_at", "label": "Exam Window Start At", "type": "date"}, {"key": "exam_window_end_at", "label": "Exam Window End At", "type": "date"}, {"key": "timezone", "label": "Timezone", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "school-exam-slot-assignments", "label": "School Exam Slot Assignments", "subPath": "school-exam-slot-assignments", "listColumns": ["assignment_status", "assignment_code", "confirmed_student_count", "assignment_source"]}]}
      toolbar={{"facet": {"key": "cycle_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "published", "label": "Published"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
