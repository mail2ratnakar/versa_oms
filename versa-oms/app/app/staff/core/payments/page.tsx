import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments (core)"
      eyebrow="staff \u00b7 core_payments"
      endpoint="/api/staff/core/payments"
      columns={[{"key": "payment_code", "label": "Payment Code"}, {"key": "expected_amount", "label": "Expected Amount"}, {"key": "received_amount", "label": "Received Amount"}, {"key": "provider", "label": "Provider"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="payments"
      createFields={[{ key: "expected_amount", label: "Expected Amount", type: "number" }, { key: "manual_evidence_file", label: "Manual Evidence File" }, { key: "reversal_reason", label: "Reversal Reason" }]}
    />
  );
}
