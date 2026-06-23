import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier batches"
      eyebrow="staff \u00b7 core_courier"
      endpoint="/api/staff/core/courier-batches"
      columns={[{"key": "batch_code", "label": "batch code"}, {"key": "courier_company", "label": "courier company"}, {"key": "awb_number", "label": "awb number"}, {"key": "dispatch_date", "label": "dispatch date"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="courier"
      createFields={[{ key: "courier_company", label: "Courier company" }, { key: "awb_number", label: "Awb number" }, { key: "dispatch_date", label: "Dispatch date", type: "date" }, { key: "sheets_expected", label: "Sheets expected", type: "number" }, { key: "sheets_dispatched", label: "Sheets dispatched", type: "number" }]}
      actions={[{"action": "dispatch", "label": "Dispatch", "variant": "light"}, {"action": "mark_in_transit", "label": "Mark in transit", "variant": "light"}, {"action": "deliver", "label": "Deliver", "variant": "light"}, {"action": "receive", "label": "Receive", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
