import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Shipments"
      eyebrow="staff \u00b7 courier_ops_shipments"
      endpoint="/api/staff/courier/shipments"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "shipment_status", "label": "Status"}]}
      statusKey="shipment_status"
      moduleId="courier_ops_shipments"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "mark_in_transit", "label": "Mark in transit", "variant": "light"}, {"action": "deliver", "label": "Deliver", "variant": "light"}, {"action": "receive", "label": "Receive", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "shipment_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "ready", "label": "Ready"}, {"value": "booked", "label": "Booked"}, {"value": "picked_up", "label": "Picked Up"}, {"value": "in_transit", "label": "In Transit"}, {"value": "delivered", "label": "Delivered"}, {"value": "receipt_pending", "label": "Receipt Pending"}, {"value": "received", "label": "Received"}, {"value": "mismatch", "label": "Mismatch"}, {"value": "lost", "label": "Lost"}, {"value": "damaged", "label": "Damaged"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
