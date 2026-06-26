import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roster Corrections"
      eyebrow="school \u00b7 school_roster_corrections"
      endpoint="/api/school/roster-corrections"
      columns={[{"key": "correction_code", "label": "Correction"}, {"key": "correction_type", "label": "Correction Type"}, {"key": "requested_change", "label": "Requested Change"}, {"key": "reason", "label": "Reason"}, {"key": "correction_status", "label": "Status"}]}
      description="Manage and review roster corrections across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Roster Corrections"}]}
      nextAction="\u2192 Use \u201cNew Roster Correction\u201d to add one, then act on it from the list."
      statusKey="correction_status"
      moduleId="school_roster_corrections"
      createFields={[{"key": "roster_batch_id", "label": "Roster Batch", "type": "reference", "refTable": "student_roster_batches"}, {"key": "student_id", "label": "Student", "type": "reference", "refTable": "students"}, {"key": "correction_type", "label": "Correction Type", "type": "select", "options": [{"value": "add_student", "label": "Add Student"}, {"value": "remove_student", "label": "Remove Student"}, {"value": "edit_student", "label": "Edit Student"}, {"value": "merge_duplicate", "label": "Merge Duplicate"}, {"value": "void_candidate_id", "label": "Void Candidate"}, {"value": "regenerate_candidate_id", "label": "Regenerate Candidate"}]}, {"key": "requested_change", "label": "Requested Change", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "impact_check", "label": "Impact Check", "type": "text"}, {"key": "applied_at", "label": "Applied At", "type": "date"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "blue"}]}
    />
  );
}
