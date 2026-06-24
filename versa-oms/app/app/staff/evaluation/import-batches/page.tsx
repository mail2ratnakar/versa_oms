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
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "uploaded", "label": "Uploaded"}, {"value": "validating", "label": "Validating"}, {"value": "validation_failed", "label": "Validation Failed"}, {"value": "validated", "label": "Validated"}, {"value": "scoring", "label": "Scoring"}, {"value": "scored", "label": "Scored"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved_for_results", "label": "Approved For Results"}, {"value": "rejected", "label": "Rejected"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
