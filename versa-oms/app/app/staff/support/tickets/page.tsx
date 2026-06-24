import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Support Tickets"
      eyebrow="staff \u00b7 support_tickets_tickets"
      endpoint="/api/staff/support/tickets"
      columns={[{"key": "ticket_code", "label": "Ticket Code"}, {"key": "ticket_source", "label": "Ticket Source"}, {"key": "subject", "label": "Subject"}, {"key": "description", "label": "Description"}, {"key": "ticket_status", "label": "Status"}]}
      statusKey="ticket_status"
      moduleId="support_tickets_tickets"
      createFields={[{ key: "ticket_source", label: "Ticket Source" }, { key: "subject", label: "Subject" }, { key: "description", label: "Description" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "ticket_status", "options": [{"value": "new", "label": "New"}, {"value": "open", "label": "Open"}, {"value": "assigned", "label": "Assigned"}, {"value": "waiting_on_school", "label": "Waiting On School"}, {"value": "waiting_on_staff", "label": "Waiting On Staff"}, {"value": "escalated", "label": "Escalated"}, {"value": "resolved", "label": "Resolved"}, {"value": "closed", "label": "Closed"}, {"value": "reopened", "label": "Reopened"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
