import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roster Corrections"
      eyebrow="staff \u00b7 student_roster_ops_corrections"
      endpoint="/api/staff/students/rosters/corrections"
      columns={[{"key": "correction_code", "label": "Correction"}, {"key": "correction_type", "label": "Correction Type"}, {"key": "requested_change", "label": "Requested Change"}, {"key": "reason", "label": "Reason"}, {"key": "correction_status", "label": "Status"}]}
      statusKey="correction_status"
      moduleId="student_roster_ops_corrections"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "roster_batch_id", "label": "Roster Batch", "type": "reference", "refTable": "student_roster_batches"}, {"key": "student_id", "label": "Student", "type": "reference", "refTable": "students"}, {"key": "correction_type", "label": "Correction Type", "type": "select", "options": [{"value": "add_student", "label": "Add Student"}, {"value": "remove_student", "label": "Remove Student"}, {"value": "edit_student", "label": "Edit Student"}, {"value": "merge_duplicate", "label": "Merge Duplicate"}, {"value": "void_candidate_id", "label": "Void Candidate"}, {"value": "regenerate_candidate_id", "label": "Regenerate Candidate"}]}, {"key": "requested_change", "label": "Requested Change", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "impact_check", "label": "Impact Check", "type": "text"}, {"key": "applied_at", "label": "Applied At", "type": "date"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "correction_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
