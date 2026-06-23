import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Support Tickets"
      eyebrow="staff \u00b7 support_tickets_tickets"
      endpoint="/api/staff/support/tickets"
      columns={[{"key": "ticket_code", "label": "ticket code"}, {"key": "ticket_source", "label": "ticket source"}, {"key": "subject", "label": "subject"}, {"key": "description", "label": "description"}, {"key": "ticket_status", "label": "Status"}]}
      statusKey="ticket_status"
      moduleId="support_tickets_tickets"
      createFields={[{ key: "ticket_source", label: "Ticket source" }, { key: "subject", label: "Subject" }, { key: "description", label: "Description" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
