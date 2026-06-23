import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Receipts"
      eyebrow="staff \u00b7 courier_ops_receipts"
      endpoint="/api/staff/courier/receipts"
      columns={[{"key": "code", "label": "code"}, {"key": "awb_number", "label": "awb number"}, {"key": "proof_file", "label": "proof file"}, {"key": "reason", "label": "reason"}, {"key": "receipt_status", "label": "Status"}]}
      statusKey="receipt_status"
      moduleId="courier_ops_receipts"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "confirm", "label": "Confirm", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
