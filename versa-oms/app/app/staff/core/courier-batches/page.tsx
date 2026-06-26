import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier batches"
      eyebrow="staff \u00b7 core_courier"
      endpoint="/api/staff/core/courier-batches"
      columns={[{"key": "batch_code", "label": "Batch"}, {"key": "courier_company", "label": "Courier Company"}, {"key": "awb_number", "label": "AWB Number"}, {"key": "dispatch_date", "label": "Dispatch Date"}, {"key": "status", "label": "Status"}]}
      description="Manage and review courier batches across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Core", "href": "/staff/core"}, {"label": "Courier Batches"}]}
      nextAction="\u2192 Use \u201cNew Courier batche\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="courier"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "courier_company", "label": "Courier Company", "type": "text"}, {"key": "awb_number", "label": "AWB Number", "type": "text"}, {"key": "dispatch_date", "label": "Dispatch Date", "type": "date"}, {"key": "sheets_expected", "label": "Sheets Expected", "type": "number"}, {"key": "sheets_dispatched", "label": "Sheets Dispatched", "type": "number"}, {"key": "sheets_received", "label": "Sheets Received", "type": "number"}, {"key": "seal_condition", "label": "Seal Condition", "type": "text"}]}
      actions={[{"action": "dispatch", "label": "Dispatch", "variant": "light"}, {"action": "mark_in_transit", "label": "Mark in transit", "variant": "light"}, {"action": "deliver", "label": "Deliver", "variant": "light"}, {"action": "receive", "label": "Receive", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
