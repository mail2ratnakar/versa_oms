import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Import Batches"
      eyebrow="staff \u00b7 evaluation_ops_import_batches"
      endpoint="/api/staff/evaluation/import-batches"
      columns={[{"key": "import_batch_code", "label": "Import Batch Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "source_file", "label": "Source File"}, {"key": "quality_report", "label": "Quality Report"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="evaluation_ops_import_batches"
      createFields={[{ key: "source_type", label: "Source Type" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
