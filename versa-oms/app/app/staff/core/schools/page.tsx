import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Schools"
      eyebrow="staff \u00b7 core_schools"
      endpoint="/api/staff/core/schools"
      columns={[{"key": "school_code", "label": "school code"}, {"key": "name", "label": "name"}, {"key": "board", "label": "board"}, {"key": "city", "label": "city"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="schools"
      createFields={[{ key: "name", label: "Name" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "coordinator_name", label: "Coordinator name" }, { key: "coordinator_email", label: "Coordinator email" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "block", "label": "Block", "variant": "light"}]}
    />
  );
}
