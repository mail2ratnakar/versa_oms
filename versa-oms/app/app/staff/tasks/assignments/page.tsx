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
      actions={[{"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
