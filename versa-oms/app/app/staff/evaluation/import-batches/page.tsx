import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Import Batches"
      eyebrow="staff \u00b7 evaluation_ops_import_batches"
      endpoint="/api/staff/evaluation/import-batches"
      columns={[{"key": "import_batch_code", "label": "import batch code"}, {"key": "source_type", "label": "source type"}, {"key": "source_file", "label": "source file"}, {"key": "quality_report", "label": "quality report"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="evaluation_ops_import_batches"
      createFields={[{ key: "source_type", label: "Source type" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
