import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier batches"
      eyebrow="staff \u00b7 core_courier"
      endpoint="/api/staff/core/courier-batches"
      columns={[{"key": "batch_code", "label": "Batch Code"}, {"key": "courier_company", "label": "Courier Company"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "dispatch_date", "label": "Dispatch Date"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="courier"
      createFields={[{ key: "courier_company", label: "Courier Company" }, { key: "awb_number", label: "Awb Number" }, { key: "dispatch_date", label: "Dispatch Date", type: "date" }, { key: "sheets_expected", label: "Sheets Expected", type: "number" }, { key: "sheets_dispatched", label: "Sheets Dispatched", type: "number" }]}
      actions={[{"action": "dispatch", "label": "Dispatch", "variant": "light"}, {"action": "mark_in_transit", "label": "Mark in transit", "variant": "light"}, {"action": "deliver", "label": "Deliver", "variant": "light"}, {"action": "receive", "label": "Receive", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
