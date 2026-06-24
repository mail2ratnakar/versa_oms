import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Dispatch Batches"
      eyebrow="staff \u00b7 courier_ops_dispatch"
      endpoint="/api/staff/courier/dispatch-batches"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="courier_ops_dispatch"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "ready_for_dispatch", "label": "Ready For Dispatch"}, {"value": "dispatched", "label": "Dispatched"}, {"value": "in_transit", "label": "In Transit"}, {"value": "delivered", "label": "Delivered"}, {"value": "exception", "label": "Exception"}, {"value": "closed", "label": "Closed"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
