import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Roster"
      eyebrow="school \u00b7 school_roster"
      endpoint="/api/school/roster"
      columns={[{"key": "batch_code", "label": "Batch Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "total_rows", "label": "Total Rows"}, {"key": "valid_rows", "label": "Valid Rows"}, {"key": "invalid_rows", "label": "Invalid Rows"}, {"key": "duplicate_rows", "label": "Duplicate Rows"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="school_roster"
      createFields={[{ key: "participation_id", label: "Participation" }, { key: "source_type", label: "Source type" }]}
      actions={[{"action": "submit", "label": "Submit for lock", "variant": "blue"}]}
      uploadAction={{"label": "Upload roster file", "subPath": "ingest", "accept": ".csv,.xlsx", "showStatuses": ["uploaded", "validation_failed"]}}
    />
  );
}
