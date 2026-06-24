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
      createFields={[{ key: "confirmed_student_count", label: "Confirmed Student Count", type: "number" }, { key: "price_per_student", label: "Price Per Student", type: "number" }]}
      actions={[{"action": "issue", "label": "Issue", "variant": "blue"}, {"action": "mark_partially_paid", "label": "Mark partially paid", "variant": "light"}, {"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "void", "label": "Void", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "payment-links", "label": "Payment Links", "subPath": "payment-links", "listColumns": ["link_status", "payment_link_code", "provider", "provider_reference"]}, {"key": "payments", "label": "Payments", "subPath": "payments", "listColumns": ["payment_status", "payment_reference", "provider", "manual_reference"]}, {"key": "adjustments", "label": "Adjustments", "subPath": "adjustments", "listColumns": ["adjustment_status", "adjustment_code", "adjustment_type", "amount"], "addFields": [{"key": "adjustment_type", "label": "Type", "type": "select", "required": true, "options": ["discount", "waiver", "credit_note", "refund", "reversal", "tax_adjustment", "commission_adjustment"]}, {"key": "amount", "label": "Amount", "type": "number", "required": true}, {"key": "reason", "label": "Reason", "type": "textarea", "required": true}]}]}
      toolbar={{"facet": {"key": "invoice_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "issued", "label": "Issued"}, {"value": "partially_paid", "label": "Partially Paid"}, {"value": "paid", "label": "Paid"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "voided", "label": "Voided"}, {"value": "superseded", "label": "Superseded"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
