import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Receipts"
      eyebrow="staff \u00b7 courier_ops_receipts"
      endpoint="/api/staff/courier/receipts"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "receipt_status", "label": "Status"}]}
      statusKey="receipt_status"
      moduleId="courier_ops_receipts"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "confirm", "label": "Confirm", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "receipt_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "confirmed", "label": "Confirmed"}, {"value": "mismatch", "label": "Mismatch"}, {"value": "rejected", "label": "Rejected"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
