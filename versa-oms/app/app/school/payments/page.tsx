import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments"
      eyebrow="school \u00b7 school_payments"
      endpoint="/api/school/payments"
      columns={[{"key": "payment_code", "label": "Payment"}, {"key": "expected_amount", "label": "Expected Amount"}, {"key": "received_amount", "label": "Received Amount"}, {"key": "provider", "label": "Provider"}, {"key": "status", "label": "Status"}]}
      description="Manage and review payments across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Payments"}]}
      nextAction="\u2192 Open a record to move it through its workflow."
      statusKey="status"
      moduleId="school_payments"
      actions={[{"action": "create_link", "label": "Pay now", "variant": "blue"}]}
    />
  );
}
