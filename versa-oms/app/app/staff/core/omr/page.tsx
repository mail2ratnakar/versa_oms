import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="OMR imports"
      eyebrow="staff \u00b7 core_omr"
      endpoint="/api/staff/core/omr"
      columns={[{"key": "import_code", "label": "import code"}, {"key": "uploaded_file", "label": "uploaded file"}, {"key": "review_status", "label": "review status"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "uploaded_file", label: "Uploaded file" }]}
      actions={[{"action": "approve_for_results", "label": "Approve for results", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
