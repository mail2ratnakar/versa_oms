import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Escalations"
      eyebrow="staff \u00b7 support_tickets_escalations"
      endpoint="/api/staff/support/escalations"
      columns={[{"key": "escalation_code", "label": "Escalation"}, {"key": "escalation_level", "label": "Escalation Level"}, {"key": "target_module", "label": "Target Module"}, {"key": "reason", "label": "Reason"}, {"key": "escalation_status", "label": "Status"}]}
      description="Manage and review escalations across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Support", "href": "/staff/support"}, {"label": "Escalations"}]}
      nextAction="\u2192 Use \u201cNew Escalation\u201d to add one, then act on it from the list."
      statusKey="escalation_status"
      moduleId="support_tickets_escalations"
      createFields={[{"key": "ticket_id", "label": "Ticket", "type": "reference", "refTable": "support_tickets"}, {"key": "escalation_level", "label": "Escalation Level", "type": "select", "options": [{"value": "module_owner", "label": "Module Owner"}, {"value": "operations_head", "label": "Operations Head"}, {"value": "company_admin", "label": "Company Admin"}, {"value": "security_reviewer", "label": "Security Reviewer"}]}, {"key": "target_module", "label": "Target Module", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "owner_id", "label": "Owner", "type": "reference", "refTable": "staff_profiles"}, {"key": "resolution_note", "label": "Resolution Note", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "resolve", "label": "Resolve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "escalation_status", "options": [{"value": "open", "label": "Open"}, {"value": "under_review", "label": "Under Review"}, {"value": "resolved", "label": "Resolved"}, {"value": "rejected", "label": "Rejected"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
