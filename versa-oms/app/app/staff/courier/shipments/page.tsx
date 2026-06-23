import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Shipments"
      eyebrow="staff \u00b7 courier_ops_shipments"
      endpoint="/api/staff/courier/shipments"
      columns={[{"key": "code", "label": "code"}, {"key": "awb_number", "label": "awb number"}, {"key": "proof_file", "label": "proof file"}, {"key": "reason", "label": "reason"}, {"key": "shipment_status", "label": "Status"}]}
      statusKey="shipment_status"
      moduleId="courier_ops_shipments"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "mark_in_transit", "label": "Mark in transit", "variant": "light"}, {"action": "deliver", "label": "Deliver", "variant": "light"}, {"action": "receive", "label": "Receive", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
