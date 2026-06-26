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
      createFields={[{"key": "participation_id", "label": "Participation", "type": "text"}, {"key": "source_type", "label": "Source type", "type": "text"}]}
      actions={[{"action": "submit", "label": "Submit for lock", "variant": "blue"}]}
      downloadAction={{"label": "Download file", "subPath": "file"}}
      uploadAction={{"label": "Upload roster file", "subPath": "ingest", "accept": ".csv,.xlsx", "showStatuses": ["uploaded", "validation_failed"]}}
    />
  );
}
