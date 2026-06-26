import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier Exceptions"
      eyebrow="staff \u00b7 courier_ops_exceptions"
      endpoint="/api/staff/courier/exceptions"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "AWB Number"}, {"key": "reason", "label": "Reason"}, {"key": "exception_status", "label": "Status"}]}
      description="Manage and review courier exceptions across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Courier", "href": "/staff/courier"}, {"label": "Exceptions"}]}
      nextAction="\u2192 Use \u201cNew Courier Exception\u201d to add one, then act on it from the list."
      statusKey="exception_status"
      moduleId="courier_ops_exceptions"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "awb_number", "label": "AWB Number", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "resolve", "label": "Resolve", "variant": "blue"}, {"action": "escalate", "label": "Escalate", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "exception_status", "options": [{"value": "open", "label": "Open"}, {"value": "under_review", "label": "Under Review"}, {"value": "awaiting_school", "label": "Awaiting School"}, {"value": "awaiting_vendor", "label": "Awaiting Vendor"}, {"value": "resolved", "label": "Resolved"}, {"value": "accepted_with_risk", "label": "Accepted With Risk"}, {"value": "escalated", "label": "Escalated"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
