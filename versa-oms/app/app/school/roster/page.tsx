import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Roster"
      eyebrow="school \u00b7 school_roster"
      endpoint="/api/school/roster"
      columns={[{"key": "batch_code", "label": "batch code"}, {"key": "source_type", "label": "source type"}, {"key": "source_file", "label": "source file"}, {"key": "upload_reason", "label": "upload reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="school_roster"
      createFields={[{ key: "participation_id", label: "Participation" }, { key: "source_type", label: "Source type" }]}
      actions={[{"action": "submit", "label": "Submit for lock", "variant": "blue"}]}
    />
  );
}
