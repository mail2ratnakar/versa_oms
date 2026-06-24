import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments"
      eyebrow="staff \u00b7 finance_ops_payments"
      endpoint="/api/staff/finance/payments"
      columns={[{"key": "payment_reference", "label": "Payment Reference"}, {"key": "provider", "label": "Provider"}, {"key": "provider_payment_id", "label": "Provider Payment ID"}, {"key": "manual_reference", "label": "Manual Reference"}, {"key": "payment_status", "label": "Status"}]}
      statusKey="payment_status"
      moduleId="finance_ops_payments"
      createFields={[{ key: "payment_reference", label: "Payment Reference" }, { key: "provider", label: "Provider" }, { key: "amount", label: "Amount", type: "number" }, { key: "currency", label: "Currency" }, { key: "confirmation_source", label: "Confirmation Source" }]}
      actions={[{"action": "confirm", "label": "Confirm", "variant": "blue"}, {"action": "reverse", "label": "Reverse", "variant": "light"}, {"action": "refund", "label": "Refund", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
