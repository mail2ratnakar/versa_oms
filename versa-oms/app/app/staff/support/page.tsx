import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Support Tickets"
      eyebrow="staff \u00b7 support_tickets"
      endpoint="/api/staff/support"
      columns={[{"key": "category_code", "label": "Category Code"}, {"key": "category_name", "label": "Category Name"}, {"key": "linked_module", "label": "Linked Module"}, {"key": "default_queue", "label": "Default Queue"}, {"key": "category_status", "label": "Status"}]}
      statusKey="category_status"
      moduleId="support_tickets"
      createFields={[{ key: "category_name", label: "Category Name" }, { key: "sla_minutes", label: "SLA Minutes", type: "number" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "category_status", "options": [{"value": "active", "label": "Active"}, {"value": "inactive", "label": "Inactive"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
