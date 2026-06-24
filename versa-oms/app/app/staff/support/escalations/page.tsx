import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Escalations"
      eyebrow="staff \u00b7 support_tickets_escalations"
      endpoint="/api/staff/support/escalations"
      columns={[{"key": "escalation_code", "label": "Escalation Code"}, {"key": "escalation_level", "label": "Escalation Level"}, {"key": "target_module", "label": "Target Module"}, {"key": "reason", "label": "Reason"}, {"key": "escalation_status", "label": "Status"}]}
      statusKey="escalation_status"
      moduleId="support_tickets_escalations"
      createFields={[{ key: "escalation_level", label: "Escalation Level" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "escalation_status", "options": [{"value": "open", "label": "Open"}, {"value": "under_review", "label": "Under Review"}, {"value": "resolved", "label": "Resolved"}, {"value": "rejected", "label": "Rejected"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
