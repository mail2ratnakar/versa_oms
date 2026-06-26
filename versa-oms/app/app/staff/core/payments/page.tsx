import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments (core)"
      eyebrow="staff \u00b7 core_payments"
      endpoint="/api/staff/core/payments"
      columns={[{"key": "payment_code", "label": "Payment"}, {"key": "expected_amount", "label": "Expected Amount"}, {"key": "received_amount", "label": "Received Amount"}, {"key": "provider", "label": "Provider"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="payments"
      createFields={[{"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "expected_amount", "label": "Expected Amount", "type": "number"}, {"key": "received_amount", "label": "Received Amount", "type": "number"}, {"key": "provider", "label": "Provider", "type": "text"}, {"key": "provider_link_id", "label": "Provider Link", "type": "text"}, {"key": "provider_payment_id", "label": "Provider Payment", "type": "text"}, {"key": "payment_reference", "label": "Payment Reference", "type": "text"}, {"key": "reversal_reason", "label": "Reversal Reason", "type": "text"}, {"key": "reconciled_at", "label": "Reconciled At", "type": "date"}]}
    />
  );
}
