import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reconciliations"
      eyebrow="staff \u00b7 finance_ops_reconciliations"
      endpoint="/api/staff/finance/reconciliations"
      columns={[{"key": "reconciliation_code", "label": "Reconciliation Code"}, {"key": "provider", "label": "Provider"}, {"key": "source_file", "label": "Source File"}, {"key": "total_records", "label": "Total Records"}, {"key": "reconciliation_status", "label": "Status"}]}
      statusKey="reconciliation_status"
      moduleId="finance_ops_reconciliations"
      createFields={[{ key: "provider", label: "Provider" }]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
      toolbar={{"facet": {"key": "reconciliation_status", "options": [{"value": "not_started", "label": "Not Started"}, {"value": "matched", "label": "Matched"}, {"value": "partially_matched", "label": "Partially Matched"}, {"value": "mismatch", "label": "Mismatch"}, {"value": "exception", "label": "Exception"}, {"value": "closed", "label": "Closed"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
