import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Roster"
      eyebrow="school \u00b7 school_roster"
      endpoint="/api/school/roster"
      columns={[{"key": "batch_code", "label": "Batch"}, {"key": "source_type", "label": "Source Type"}, {"key": "total_rows", "label": "Total Rows"}, {"key": "valid_rows", "label": "Valid Rows"}, {"key": "invalid_rows", "label": "Invalid Rows"}, {"key": "duplicate_rows", "label": "Duplicate Rows"}, {"key": "batch_status", "label": "Status"}]}
      description="Manage and review student roster across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Roster"}]}
      nextAction="\u2192 Use \u201cNew Student Roster\u201d to add one, then act on it from the list."
      statusKey="batch_status"
      moduleId="school_roster"
      createFields={[{"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "source_type", "label": "Source Type", "type": "select", "options": [{"value": "school_uploaded", "label": "School Uploaded"}, {"value": "staff_uploaded_on_behalf", "label": "Staff Uploaded On Behalf"}, {"value": "migration", "label": "Migration"}, {"value": "correction_batch", "label": "Correction Batch"}]}, {"key": "upload_reason", "label": "Upload Reason", "type": "text"}, {"key": "total_rows", "label": "Total Rows", "type": "number"}, {"key": "valid_rows", "label": "Valid Rows", "type": "number"}, {"key": "invalid_rows", "label": "Invalid Rows", "type": "number"}, {"key": "duplicate_rows", "label": "Duplicate Rows", "type": "number"}, {"key": "validation_report", "label": "Validation Report", "type": "text"}, {"key": "duplicate_report", "label": "Duplicate Report", "type": "text"}, {"key": "locked_at", "label": "Locked At", "type": "date"}, {"key": "superseded_by_batch_id", "label": "Superseded By Batch", "type": "reference", "refTable": "student_roster_batches"}]}
      actions={[{"action": "submit", "label": "Submit for lock", "variant": "blue"}]}
      downloadAction={{"label": "Download file", "subPath": "file"}}
      uploadAction={{"label": "Upload roster file", "subPath": "ingest", "accept": ".csv,.xlsx", "showStatuses": ["uploaded", "validation_failed"]}}
    />
  );
}
