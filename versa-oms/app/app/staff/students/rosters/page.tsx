import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Rosters"
      eyebrow="staff \u00b7 student_roster_ops"
      endpoint="/api/staff/students/rosters"
      columns={[{"key": "batch_code", "label": "Batch"}, {"key": "source_type", "label": "Source Type"}, {"key": "total_rows", "label": "Total Rows"}, {"key": "valid_rows", "label": "Valid Rows"}, {"key": "invalid_rows", "label": "Invalid Rows"}, {"key": "duplicate_rows", "label": "Duplicate Rows"}, {"key": "batch_status", "label": "Status"}]}
      description="Validate and lock school student rosters before exam materials are generated."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Students", "href": "/staff/students"}, {"label": "Rosters"}]}
      nextAction="\u2192 Use \u201cNew Student Roster\u201d to add one, then act on it from the list."
      statusKey="batch_status"
      moduleId="student_roster_ops"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "source_type", "label": "Source Type", "type": "select", "options": [{"value": "school_uploaded", "label": "School Uploaded"}, {"value": "staff_uploaded_on_behalf", "label": "Staff Uploaded On Behalf"}, {"value": "migration", "label": "Migration"}, {"value": "correction_batch", "label": "Correction Batch"}]}, {"key": "upload_reason", "label": "Upload Reason", "type": "text"}, {"key": "total_rows", "label": "Total Rows", "type": "number"}, {"key": "valid_rows", "label": "Valid Rows", "type": "number"}, {"key": "invalid_rows", "label": "Invalid Rows", "type": "number"}, {"key": "duplicate_rows", "label": "Duplicate Rows", "type": "number"}, {"key": "validation_report", "label": "Validation Report", "type": "text"}, {"key": "duplicate_report", "label": "Duplicate Report", "type": "text"}, {"key": "locked_at", "label": "Locked At", "type": "date"}, {"key": "superseded_by_batch_id", "label": "Superseded By Batch", "type": "reference", "refTable": "student_roster_batches"}]}
      actions={[{"action": "validate", "label": "Validate", "variant": "light"}, {"action": "submit_for_lock", "label": "Submit for lock", "variant": "light"}, {"action": "lock", "label": "Lock", "variant": "blue"}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      downloadAction={{"label": "Download file", "subPath": "file"}}
      uploadAction={{"label": "Upload roster file", "subPath": "ingest", "accept": ".csv,.xlsx", "showStatuses": ["uploaded", "validation_failed"], "reason": true}}
      detailPanels={[{"key": "corrections", "label": "Corrections", "subPath": "corrections", "listColumns": ["correction_status", "correction_code", "correction_type", "requested_change"]}, {"key": "candidate-id-events", "label": "Candidate Id Events", "subPath": "candidate-id-events", "listColumns": ["event_code", "reason", "metadata", "created_at"]}, {"key": "events", "label": "Events", "subPath": "events", "listColumns": ["event_code", "previous_status", "new_status", "reason"]}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "uploaded", "label": "Uploaded"}, {"value": "validating", "label": "Validating"}, {"value": "validation_failed", "label": "Validation Failed"}, {"value": "validated", "label": "Validated"}, {"value": "submitted_for_lock", "label": "Submitted For Lock"}, {"value": "locked", "label": "Locked"}, {"value": "unlock_requested", "label": "Unlock Requested"}, {"value": "correction_pending", "label": "Correction Pending"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
