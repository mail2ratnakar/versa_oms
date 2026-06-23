import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payment Links"
      eyebrow="staff \u00b7 finance_ops_payment_links"
      endpoint="/api/staff/finance/payment-links"
      columns={[{"key": "payment_link_code", "label": "payment link code"}, {"key": "provider", "label": "provider"}, {"key": "provider_reference", "label": "provider reference"}, {"key": "payment_url", "label": "payment url"}, {"key": "link_status", "label": "Status"}]}
      statusKey="link_status"
      moduleId="finance_ops_payment_links"
      createFields={[{ key: "provider", label: "Provider" }, { key: "amount", label: "Amount", type: "number" }, { key: "currency", label: "Currency" }, { key: "expires_at", label: "Expires at" }]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
