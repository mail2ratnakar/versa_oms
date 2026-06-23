import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reconciliations"
      eyebrow="staff \u00b7 finance_ops_reconciliations"
      endpoint="/api/staff/finance/reconciliations"
      columns={[{"key": "reconciliation_code", "label": "reconciliation code"}, {"key": "provider", "label": "provider"}, {"key": "source_file", "label": "source file"}, {"key": "total_records", "label": "total records"}, {"key": "reconciliation_status", "label": "Status"}]}
      statusKey="reconciliation_status"
      moduleId="finance_ops_reconciliations"
      createFields={[{ key: "provider", label: "Provider" }]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
