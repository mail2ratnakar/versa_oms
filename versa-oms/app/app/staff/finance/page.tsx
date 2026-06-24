import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Finance"
      eyebrow="staff \u00b7 finance_ops"
      endpoint="/api/staff/finance"
      columns={[{"key": "invoice_number", "label": "Invoice Number"}, {"key": "currency", "label": "Currency"}, {"key": "price_per_student", "label": "Price Per Student"}, {"key": "gross_amount", "label": "Gross Amount"}, {"key": "invoice_status", "label": "Status"}]}
      statusKey="invoice_status"
      moduleId="finance_ops"
      createFields={[{ key: "invoice_number", label: "Invoice Number" }, { key: "price_per_student", label: "Price Per Student", type: "number" }, { key: "gross_amount", label: "Gross Amount", type: "number" }, { key: "net_payable_amount", label: "Net Payable Amount", type: "number" }, { key: "balance_due", label: "Balance Due", type: "number" }]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "payment-links", "label": "Payment Links", "subPath": "payment-links", "listColumns": ["link_status", "payment_link_code", "provider", "provider_reference"]}, {"key": "payments", "label": "Payments", "subPath": "payments", "listColumns": ["payment_status", "payment_reference", "provider", "manual_reference"]}, {"key": "adjustments", "label": "Adjustments", "subPath": "adjustments", "listColumns": ["adjustment_status", "adjustment_code", "adjustment_type", "amount"]}]}
      toolbar={{"facet": {"key": "invoice_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "issued", "label": "Issued"}, {"value": "partially_paid", "label": "Partially Paid"}, {"value": "paid", "label": "Paid"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "voided", "label": "Voided"}, {"value": "superseded", "label": "Superseded"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
