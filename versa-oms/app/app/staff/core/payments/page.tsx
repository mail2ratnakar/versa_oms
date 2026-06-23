import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments (core)"
      eyebrow="staff \u00b7 core_payments"
      endpoint="/api/staff/core/payments"
      columns={[{"key": "payment_code", "label": "payment code"}, {"key": "expected_amount", "label": "expected amount"}, {"key": "received_amount", "label": "received amount"}, {"key": "provider", "label": "provider"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "expected_amount", label: "Expected amount", type: "number" }, { key: "manual_evidence_file", label: "Manual evidence file" }, { key: "reversal_reason", label: "Reversal reason" }]}
    />
  );
}
