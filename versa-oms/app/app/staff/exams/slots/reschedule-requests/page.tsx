import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reschedule Requests"
      eyebrow="staff \u00b7 exam_slot_ops_reschedules"
      endpoint="/api/staff/exams/slots/reschedule-requests"
      columns={[{"key": "reschedule_code", "label": "Reschedule"}, {"key": "reason", "label": "Reason"}, {"key": "capacity_impact", "label": "Capacity Impact"}, {"key": "material_impact", "label": "Material Impact"}, {"key": "reschedule_status", "label": "Status"}]}
      description="Manage and review reschedule requests across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Exams", "href": "/staff/exams"}, {"label": "Slots", "href": "/staff/exams/slots"}, {"label": "Reschedule Requests"}]}
      nextAction="\u2192 Use \u201cNew Reschedule Request\u201d to add one, then act on it from the list."
      statusKey="reschedule_status"
      moduleId="exam_slot_ops_reschedules"
      createFields={[{"key": "assignment_id", "label": "Assignment", "type": "reference", "refTable": "school_exam_slot_assignments"}, {"key": "from_slot_id", "label": "From Slot", "type": "reference", "refTable": "exam_slots"}, {"key": "to_slot_id", "label": "To Slot", "type": "reference", "refTable": "exam_slots"}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "capacity_impact", "label": "Capacity Impact", "type": "text"}, {"key": "material_impact", "label": "Material Impact", "type": "text"}, {"key": "applied_at", "label": "Applied At", "type": "date"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "reschedule_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
