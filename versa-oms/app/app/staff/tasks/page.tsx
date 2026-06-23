import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Queue"
      eyebrow="staff \u00b7 task_work_queue"
      endpoint="/api/staff/tasks"
      columns={[{"key": "queue_code", "label": "queue code"}, {"key": "queue_name", "label": "queue name"}, {"key": "queue_type", "label": "queue type"}, {"key": "owning_module", "label": "owning module"}, {"key": "queue_status", "label": "Status"}]}
      statusKey="queue_status"
      createFields={[{ key: "queue_name", label: "Queue name" }, { key: "queue_type", label: "Queue type" }, { key: "owner_role", label: "Owner role" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
