import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Adjustments"
      eyebrow="staff \u00b7 finance_ops_adjustments"
      endpoint="/api/staff/finance/adjustments"
      columns={[{"key": "adjustment_code", "label": "adjustment code"}, {"key": "adjustment_type", "label": "adjustment type"}, {"key": "amount", "label": "amount"}, {"key": "reason", "label": "reason"}, {"key": "adjustment_status", "label": "Status"}]}
      statusKey="adjustment_status"
      moduleId="finance_ops_adjustments"
      createFields={[{ key: "adjustment_type", label: "Adjustment type" }, { key: "amount", label: "Amount", type: "number" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
