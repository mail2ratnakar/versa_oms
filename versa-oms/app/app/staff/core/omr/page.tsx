import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="OMR imports"
      eyebrow="staff \u00b7 core_omr"
      endpoint="/api/staff/core/omr"
      columns={[{"key": "import_code", "label": "Import Code"}, {"key": "uploaded_file", "label": "Uploaded File"}, {"key": "review_status", "label": "Review Status"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="omr_imports"
      createFields={[{ key: "uploaded_file", label: "Uploaded File" }]}
      actions={[{"action": "approve_for_results", "label": "Approve for results", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
