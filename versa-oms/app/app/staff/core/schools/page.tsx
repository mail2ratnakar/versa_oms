import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Schools"
      eyebrow="staff \u00b7 core_schools"
      endpoint="/api/staff/core/schools"
      columns={[{"key": "school_code", "label": "School Code"}, {"key": "name", "label": "Name"}, {"key": "board", "label": "Board"}, {"key": "city", "label": "City"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="schools"
      createFields={[{ key: "name", label: "Name" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "coordinator_name", label: "Coordinator Name" }, { key: "coordinator_email", label: "Coordinator Email" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
