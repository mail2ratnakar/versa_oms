import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Rosters"
      eyebrow="staff \u00b7 student_roster_ops"
      endpoint="/api/staff/students/rosters"
      columns={[{"key": "batch_code", "label": "Batch Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "source_file", "label": "Source File"}, {"key": "upload_reason", "label": "Upload Reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="student_roster_ops"
      createFields={[{ key: "source_type", label: "Source Type" }]}
      actions={[{"action": "validate", "label": "Validate", "variant": "light"}, {"action": "submit_for_lock", "label": "Submit for lock", "variant": "light"}, {"action": "lock", "label": "Lock", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
