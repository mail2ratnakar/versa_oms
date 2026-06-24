import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payment Links"
      eyebrow="staff \u00b7 finance_ops_payment_links"
      endpoint="/api/staff/finance/payment-links"
      columns={[{"key": "payment_link_code", "label": "Payment Link Code"}, {"key": "provider", "label": "Provider"}, {"key": "provider_reference", "label": "Provider Reference"}, {"key": "payment_url", "label": "Payment URL"}, {"key": "link_status", "label": "Status"}]}
      statusKey="link_status"
      moduleId="finance_ops_payment_links"
      createFields={[{ key: "provider", label: "Provider" }, { key: "amount", label: "Amount", type: "number" }, { key: "currency", label: "Currency" }, { key: "expires_at", label: "Expires At" }]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
