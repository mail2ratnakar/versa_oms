import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Support Tickets"
      eyebrow="staff \u00b7 support_tickets"
      endpoint="/api/staff/support"
      columns={[{"key": "category_code", "label": "Category"}, {"key": "category_name", "label": "Category Name"}, {"key": "linked_module", "label": "Linked Module"}, {"key": "default_queue", "label": "Default Queue"}, {"key": "category_status", "label": "Status"}]}
      description="Work school support tickets to resolution with internal notes kept private."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Support"}]}
      nextAction="\u2192 Use \u201cNew Support Ticket\u201d to add one, then act on it from the list."
      statusKey="category_status"
      moduleId="support_tickets"
      createFields={[{"key": "category_name", "label": "Category Name", "type": "text"}, {"key": "linked_module", "label": "Linked Module", "type": "text"}, {"key": "default_queue", "label": "Default Queue", "type": "text"}, {"key": "default_priority", "label": "Default Priority", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "sla_minutes", "label": "SLA Minutes", "type": "number"}, {"key": "restricted", "label": "Restricted", "type": "checkbox"}]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "tickets", "label": "Tickets", "subPath": "tickets", "listColumns": ["ticket_status", "ticket_code", "ticket_source", "subject"]}]}
      toolbar={{"facet": {"key": "category_status", "options": [{"value": "active", "label": "Active"}, {"value": "inactive", "label": "Inactive"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
