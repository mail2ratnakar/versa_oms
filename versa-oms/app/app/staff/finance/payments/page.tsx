import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Payments"
      eyebrow="staff \u00b7 finance_ops_payments"
      endpoint="/api/staff/finance/payments"
      columns={[{"key": "payment_reference", "label": "Payment Reference"}, {"key": "provider", "label": "Provider"}, {"key": "provider_payment_id", "label": "Provider Payment"}, {"key": "manual_reference", "label": "Manual Reference"}, {"key": "payment_status", "label": "Status"}]}
      statusKey="payment_status"
      moduleId="finance_ops_payments"
      createFields={[{"key": "payment_reference", "label": "Payment Reference", "type": "text"}, {"key": "invoice_id", "label": "Invoice", "type": "reference", "refTable": "finance_invoices"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "payment_link_id", "label": "Payment Link", "type": "reference", "refTable": "finance_payment_links"}, {"key": "provider", "label": "Provider", "type": "select", "options": [{"value": "mock", "label": "Mock"}, {"value": "razorpay", "label": "Razorpay"}, {"value": "bank_transfer", "label": "Bank Transfer"}, {"value": "manual", "label": "Manual"}, {"value": "other", "label": "Other"}]}, {"key": "provider_payment_id", "label": "Provider Payment", "type": "text"}, {"key": "manual_reference", "label": "Manual Reference", "type": "text"}, {"key": "amount", "label": "Amount", "type": "number"}, {"key": "currency", "label": "Currency", "type": "text"}, {"key": "paid_at", "label": "Paid At", "type": "date"}, {"key": "confirmation_source", "label": "Confirmation Source", "type": "select", "options": [{"value": "gateway", "label": "Gateway"}, {"value": "manual", "label": "Manual"}, {"value": "bank_reconciliation", "label": "Bank Reconciliation"}, {"value": "mock", "label": "Mock"}]}, {"key": "confirmation_reason", "label": "Confirmation Reason", "type": "text"}]}
      actions={[{"action": "confirm", "label": "Confirm", "variant": "blue"}, {"action": "reverse", "label": "Reverse", "variant": "light"}, {"action": "refund", "label": "Refund", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "payment_status", "options": [{"value": "pending", "label": "Pending"}, {"value": "confirmed", "label": "Confirmed"}, {"value": "failed", "label": "Failed"}, {"value": "reversed", "label": "Reversed"}, {"value": "refunded", "label": "Refunded"}, {"value": "partially_refunded", "label": "Partially Refunded"}, {"value": "cancelled", "label": "Cancelled"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
