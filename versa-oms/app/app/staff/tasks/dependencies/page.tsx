import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Task Dependencies"
      eyebrow="staff \u00b7 task_work_queue_dependencies"
      endpoint="/api/staff/tasks/dependencies"
      columns={[{"key": "dependency_type", "label": "dependency type"}, {"key": "related_module", "label": "related module"}, {"key": "related_entity_type", "label": "related entity type"}, {"key": "related_entity_id", "label": "related entity id"}, {"key": "dependency_status", "label": "Status"}]}
      statusKey="dependency_status"
      moduleId="task_work_queue_dependencies"
      createFields={[{ key: "dependency_type", label: "Dependency type" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
