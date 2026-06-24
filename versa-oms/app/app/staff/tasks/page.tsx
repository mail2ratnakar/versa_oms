import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Queue"
      eyebrow="staff \u00b7 task_work_queue"
      endpoint="/api/staff/tasks"
      columns={[{"key": "queue_code", "label": "Queue Code"}, {"key": "queue_name", "label": "Queue Name"}, {"key": "queue_type", "label": "Queue Type"}, {"key": "owning_module", "label": "Owning Module"}, {"key": "queue_status", "label": "Status"}]}
      statusKey="queue_status"
      moduleId="task_work_queue"
      createFields={[{ key: "queue_name", label: "Queue Name" }, { key: "queue_type", label: "Queue Type" }, { key: "owner_role", label: "Owner Role" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "queue_status", "options": [{"value": "active", "label": "Active"}, {"value": "paused", "label": "Paused"}, {"value": "inactive", "label": "Inactive"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
