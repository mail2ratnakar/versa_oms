import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Support Tickets"
      eyebrow="staff \u00b7 support_tickets_tickets"
      endpoint="/api/staff/support/tickets"
      columns={[{"key": "ticket_code", "label": "Ticket"}, {"key": "ticket_source", "label": "Ticket Source"}, {"key": "subject", "label": "Subject"}, {"key": "description", "label": "Description"}, {"key": "ticket_status", "label": "Status"}]}
      statusKey="ticket_status"
      moduleId="support_tickets_tickets"
      createFields={[{"key": "ticket_source", "label": "Ticket Source", "type": "select", "options": [{"value": "school", "label": "School"}, {"value": "staff", "label": "Staff"}, {"value": "system", "label": "System"}]}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "category_id", "label": "Category", "type": "reference", "refTable": "support_ticket_categories"}, {"key": "subject", "label": "Subject", "type": "text"}, {"key": "description", "label": "Description", "type": "text"}, {"key": "priority", "label": "Priority", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "assigned_to", "label": "Assigned To", "type": "reference", "refTable": "staff_profiles"}, {"key": "assigned_queue", "label": "Assigned Queue", "type": "text"}, {"key": "sla_due_at", "label": "SLA Due At", "type": "date"}, {"key": "resolution_code", "label": "Resolution", "type": "text"}, {"key": "resolution_summary", "label": "Resolution Summary", "type": "text"}, {"key": "closed_at", "label": "Closed At", "type": "date"}]}
      actions={[{"action": "escalate", "label": "Escalate", "variant": "light"}, {"action": "resolve", "label": "Resolve", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "reopen", "label": "Reopen", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "ticket-messages", "label": "Ticket Messages", "subPath": "ticket-messages", "listColumns": ["message_status", "message_type", "visibility", "body"]}, {"key": "ticket-attachments", "label": "Tickettachments", "subPath": "ticket-attachments", "listColumns": ["attachment_status", "file_name", "file_size_bytes", "sensitive_flag"]}, {"key": "ticket-links", "label": "Ticket Links", "subPath": "ticket-links", "listColumns": ["link_status", "linked_module", "linked_entity_type", "safe_summary_snapshot"]}, {"key": "ticket-escalations", "label": "Ticket Escalations", "subPath": "ticket-escalations", "listColumns": ["escalation_status", "escalation_code", "escalation_level", "target_module"]}]}
      toolbar={{"facet": {"key": "ticket_status", "options": [{"value": "new", "label": "New"}, {"value": "open", "label": "Open"}, {"value": "assigned", "label": "Assigned"}, {"value": "waiting_on_school", "label": "Waiting On School"}, {"value": "waiting_on_staff", "label": "Waiting On Staff"}, {"value": "escalated", "label": "Escalated"}, {"value": "resolved", "label": "Resolved"}, {"value": "closed", "label": "Closed"}, {"value": "reopened", "label": "Reopened"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
