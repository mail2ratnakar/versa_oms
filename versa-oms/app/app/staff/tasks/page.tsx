import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Queue"
      eyebrow="staff \u00b7 task_work_queue"
      endpoint="/api/staff/tasks"
      columns={[{"key": "queue_code", "label": "Queue"}, {"key": "queue_name", "label": "Queue Name"}, {"key": "queue_type", "label": "Queue Type"}, {"key": "owning_module", "label": "Owning Module"}, {"key": "queue_status", "label": "Status"}]}
      statusKey="queue_status"
      moduleId="task_work_queue"
      createFields={[{"key": "queue_name", "label": "Queue Name", "type": "text"}, {"key": "queue_type", "label": "Queue Type", "type": "select", "options": [{"value": "module_queue", "label": "Module Queue"}, {"value": "role_queue", "label": "Role Queue"}, {"value": "approval_queue", "label": "Approval Queue"}, {"value": "sla_queue", "label": "SLA Queue"}, {"value": "security_queue", "label": "Security Queue"}, {"value": "support_queue", "label": "Support Queue"}, {"value": "operations_queue", "label": "Operations Queue"}]}, {"key": "owning_module", "label": "Owning Module", "type": "text"}, {"key": "owner_role", "label": "Owner Role", "type": "text"}, {"key": "scope_rule", "label": "Scope Rule", "type": "text"}, {"key": "default_priority", "label": "Default Priority", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "default_sla_minutes", "label": "Default SLA Minutes", "type": "number"}]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "work-tasks", "label": "Work Tasks", "subPath": "work-tasks", "listColumns": ["task_status", "task_code", "task_title", "task_description"]}, {"key": "assignments", "label": "Assignments", "subPath": "assignments", "listColumns": ["assignment_status", "assigned_to", "assigned_role", "assignment_reason"]}]}
      toolbar={{"facet": {"key": "queue_status", "options": [{"value": "active", "label": "Active"}, {"value": "paused", "label": "Paused"}, {"value": "inactive", "label": "Inactive"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
