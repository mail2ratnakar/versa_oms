import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Dependencies"
      eyebrow="staff \u00b7 task_work_queue_dependencies"
      endpoint="/api/staff/tasks/dependencies"
      columns={[{"key": "dependency_type", "label": "Dependency Type"}, {"key": "related_module", "label": "Related Module"}, {"key": "related_entity_type", "label": "Related Entity Type"}, {"key": "related_entity_id", "label": "Related Entity"}, {"key": "dependency_status", "label": "Status"}]}
      description="Manage and review task dependencies across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Tasks", "href": "/staff/tasks"}, {"label": "Dependencies"}]}
      nextAction="\u2192 Use \u201cNew Task Dependencie\u201d to add one, then act on it from the list."
      statusKey="dependency_status"
      moduleId="task_work_queue_dependencies"
      createFields={[{"key": "task_id", "label": "Task", "type": "reference", "refTable": "work_tasks"}, {"key": "dependency_type", "label": "Dependency Type", "type": "select", "options": [{"value": "blocks", "label": "Blocks"}, {"value": "blocked_by", "label": "Blocked By"}, {"value": "related_to", "label": "Related To"}, {"value": "approval_for", "label": "Approval For"}, {"value": "follow_up_for", "label": "Follow Up For"}]}, {"key": "related_task_id", "label": "Related Task", "type": "reference", "refTable": "work_tasks"}, {"key": "related_module", "label": "Related Module", "type": "text"}, {"key": "related_entity_type", "label": "Related Entity Type", "type": "text"}, {"key": "related_entity_id", "label": "Related Entity", "type": "text"}]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "dependency_status", "options": [{"value": "active", "label": "Active"}, {"value": "resolved", "label": "Resolved"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
