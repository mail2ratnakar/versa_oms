import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments"
      eyebrow="school \u00b7 school_payments"
      endpoint="/api/school/payments"
      columns={[{"key": "payment_code", "label": "Payment"}, {"key": "expected_amount", "label": "Expected Amount"}, {"key": "received_amount", "label": "Received Amount"}, {"key": "provider", "label": "Provider"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="school_payments"
      actions={[{"action": "create_link", "label": "Pay now", "variant": "blue"}]}
    />
  );
}
