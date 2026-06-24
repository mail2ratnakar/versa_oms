import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Assignments"
      eyebrow="staff \u00b7 task_work_queue_assignments"
      endpoint="/api/staff/tasks/assignments"
      columns={[{"key": "assigned_role", "label": "Assigned Role"}, {"key": "assignment_reason", "label": "Assignment Reason"}, {"key": "assignment_status", "label": "Status"}]}
      statusKey="assignment_status"
      moduleId="task_work_queue_assignments"
      actions={[{"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "assignment_status", "options": [{"value": "active", "label": "Active"}, {"value": "superseded", "label": "Superseded"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
