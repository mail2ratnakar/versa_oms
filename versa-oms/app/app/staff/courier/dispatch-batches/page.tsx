import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Dispatch Batches"
      eyebrow="staff \u00b7 courier_ops_dispatch"
      endpoint="/api/staff/courier/dispatch-batches"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "AWB Number"}, {"key": "reason", "label": "Reason"}, {"key": "batch_status", "label": "Status"}]}
      description="Manage and review dispatch batches across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Courier", "href": "/staff/courier"}, {"label": "Dispatch Batches"}]}
      nextAction="\u2192 Use \u201cNew Dispatch Batche\u201d to add one, then act on it from the list."
      statusKey="batch_status"
      moduleId="courier_ops_dispatch"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "awb_number", "label": "AWB Number", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "ready_for_dispatch", "label": "Ready For Dispatch"}, {"value": "dispatched", "label": "Dispatched"}, {"value": "in_transit", "label": "In Transit"}, {"value": "delivered", "label": "Delivered"}, {"value": "exception", "label": "Exception"}, {"value": "closed", "label": "Closed"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
