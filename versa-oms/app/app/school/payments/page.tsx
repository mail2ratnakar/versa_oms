import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments"
      eyebrow="school \u00b7 school_payments"
      endpoint="/api/school/payments"
      columns={[{"key": "payment_code", "label": "payment code"}, {"key": "expected_amount", "label": "expected amount"}, {"key": "received_amount", "label": "received amount"}, {"key": "provider", "label": "provider"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="school_payments"
    />
  );
}
