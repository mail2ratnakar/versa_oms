import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier Exceptions"
      eyebrow="staff \u00b7 courier_ops_exceptions"
      endpoint="/api/staff/courier/exceptions"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "exception_status", "label": "Status"}]}
      statusKey="exception_status"
      moduleId="courier_ops_exceptions"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "exception_status", "options": [{"value": "open", "label": "Open"}, {"value": "under_review", "label": "Under Review"}, {"value": "awaiting_school", "label": "Awaiting School"}, {"value": "awaiting_vendor", "label": "Awaiting Vendor"}, {"value": "resolved", "label": "Resolved"}, {"value": "accepted_with_risk", "label": "Accepted With Risk"}, {"value": "escalated", "label": "Escalated"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
