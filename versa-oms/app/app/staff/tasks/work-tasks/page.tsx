import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Work Tasks"
      eyebrow="staff \u00b7 task_work_queue_tasks"
      endpoint="/api/staff/tasks/work-tasks"
      columns={[{"key": "task_code", "label": "Task Code"}, {"key": "task_title", "label": "Task Title"}, {"key": "task_description", "label": "Task Description"}, {"key": "task_type", "label": "Task Type"}, {"key": "task_status", "label": "Status"}]}
      statusKey="task_status"
      moduleId="task_work_queue_tasks"
      createFields={[{ key: "task_title", label: "Task Title" }, { key: "task_type", label: "Task Type" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "task_status", "options": [{"value": "new", "label": "New"}, {"value": "queued", "label": "Queued"}, {"value": "assigned", "label": "Assigned"}, {"value": "in_progress", "label": "In Progress"}, {"value": "blocked", "label": "Blocked"}, {"value": "waiting", "label": "Waiting"}, {"value": "escalated", "label": "Escalated"}, {"value": "completed", "label": "Completed"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "reopened", "label": "Reopened"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
