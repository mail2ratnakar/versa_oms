import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Finance"
      eyebrow="staff \u00b7 finance_ops"
      endpoint="/api/staff/finance"
      columns={[{"key": "invoice_number", "label": "invoice number"}, {"key": "currency", "label": "currency"}, {"key": "price_per_student", "label": "price per student"}, {"key": "gross_amount", "label": "gross amount"}, {"key": "invoice_status", "label": "Status"}]}
      statusKey="invoice_status"
      createFields={[{ key: "invoice_number", label: "Invoice number" }, { key: "price_per_student", label: "Price per student", type: "number" }, { key: "gross_amount", label: "Gross amount", type: "number" }, { key: "net_payable_amount", label: "Net payable amount", type: "number" }, { key: "balance_due", label: "Balance due", type: "number" }]}
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
