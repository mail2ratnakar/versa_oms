import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payment Links"
      eyebrow="staff \u00b7 finance_ops_payment_links"
      endpoint="/api/staff/finance/payment-links"
      columns={[{"key": "payment_link_code", "label": "Payment Link"}, {"key": "provider", "label": "Provider"}, {"key": "provider_reference", "label": "Provider Reference"}, {"key": "payment_url", "label": "Payment URL"}, {"key": "link_status", "label": "Status"}]}
      description="Manage and review payment links across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Finance", "href": "/staff/finance"}, {"label": "Payment Links"}]}
      nextAction="\u2192 Use \u201cNew Payment Link\u201d to add one, then act on it from the list."
      statusKey="link_status"
      moduleId="finance_ops_payment_links"
      createFields={[{"key": "invoice_id", "label": "Invoice", "type": "reference", "refTable": "finance_invoices"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "provider", "label": "Provider", "type": "select", "options": [{"value": "mock", "label": "Mock"}, {"value": "razorpay", "label": "Razorpay"}, {"value": "bank_transfer", "label": "Bank Transfer"}, {"value": "manual", "label": "Manual"}, {"value": "other", "label": "Other"}]}, {"key": "provider_reference", "label": "Provider Reference", "type": "text"}, {"key": "payment_url", "label": "Payment URL", "type": "text"}, {"key": "amount", "label": "Amount", "type": "number"}, {"key": "currency", "label": "Currency", "type": "text"}, {"key": "expires_at", "label": "Expires At", "type": "date"}]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "payments", "label": "Payments", "subPath": "payments", "listColumns": ["payment_status", "payment_reference", "provider", "manual_reference"]}]}
      toolbar={{"facet": {"key": "link_status", "options": [{"value": "created", "label": "Created"}, {"value": "sent", "label": "Sent"}, {"value": "opened", "label": "Opened"}, {"value": "paid", "label": "Paid"}, {"value": "expired", "label": "Expired"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "failed", "label": "Failed"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
