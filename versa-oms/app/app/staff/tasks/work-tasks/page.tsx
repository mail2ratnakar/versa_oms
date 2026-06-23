import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Work Tasks"
      eyebrow="staff \u00b7 task_work_queue_tasks"
      endpoint="/api/staff/tasks/work-tasks"
      columns={[{"key": "task_code", "label": "task code"}, {"key": "task_title", "label": "task title"}, {"key": "task_description", "label": "task description"}, {"key": "task_type", "label": "task type"}, {"key": "task_status", "label": "Status"}]}
      statusKey="task_status"
      moduleId="task_work_queue_tasks"
      createFields={[{ key: "task_title", label: "Task title" }, { key: "task_type", label: "Task type" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
