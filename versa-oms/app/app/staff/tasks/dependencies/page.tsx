import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Dependencies"
      eyebrow="staff \u00b7 task_work_queue_dependencies"
      endpoint="/api/staff/tasks/dependencies"
      columns={[{"key": "dependency_type", "label": "Dependency Type"}, {"key": "related_module", "label": "Related Module"}, {"key": "related_entity_type", "label": "Related Entity Type"}, {"key": "related_entity_id", "label": "Related Entity ID"}, {"key": "dependency_status", "label": "Status"}]}
      statusKey="dependency_status"
      moduleId="task_work_queue_dependencies"
      createFields={[{ key: "dependency_type", label: "Dependency Type" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
