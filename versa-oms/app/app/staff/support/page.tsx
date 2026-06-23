import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Support Tickets"
      eyebrow="staff \u00b7 support_tickets"
      endpoint="/api/staff/support"
      columns={[{"key": "category_code", "label": "category code"}, {"key": "category_name", "label": "category name"}, {"key": "linked_module", "label": "linked module"}, {"key": "default_queue", "label": "default queue"}, {"key": "category_status", "label": "Status"}]}
      statusKey="category_status"
      moduleId="support_tickets"
      createFields={[{ key: "category_name", label: "Category name" }, { key: "sla_minutes", label: "Sla minutes", type: "number" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
