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
      actions={[{"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
