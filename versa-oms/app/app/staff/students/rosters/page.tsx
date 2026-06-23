import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Rosters"
      eyebrow="staff \u00b7 student_roster_ops"
      endpoint="/api/staff/students/rosters"
      columns={[{"key": "batch_code", "label": "batch code"}, {"key": "source_type", "label": "source type"}, {"key": "source_file", "label": "source file"}, {"key": "upload_reason", "label": "upload reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      createFields={[{ key: "source_type", label: "Source type" }]}
      actions={[{"action": "validate", "label": "Validate", "variant": "light"}, {"action": "submit_for_lock", "label": "Submit for lock", "variant": "light"}, {"action": "lock", "label": "Lock", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
