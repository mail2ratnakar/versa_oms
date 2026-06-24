import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Roster"
      eyebrow="school \u00b7 school_roster"
      endpoint="/api/school/roster"
      columns={[{"key": "batch_code", "label": "Batch Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "source_file", "label": "Source File"}, {"key": "upload_reason", "label": "Upload Reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="school_roster"
      createFields={[{ key: "participation_id", label: "Participation" }, { key: "source_type", label: "Source type" }]}
      actions={[{"action": "submit", "label": "Submit for lock", "variant": "blue"}]}
    />
  );
}
