import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Result Publications"
      eyebrow="staff \u00b7 results_publications"
      endpoint="/api/staff/results/publications"
      columns={[{"key": "publication_code", "label": "Publication Code"}, {"key": "grade", "label": "Grade"}, {"key": "scope_type", "label": "Scope Type"}, {"key": "scope_value", "label": "Scope Value"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results_publications"
      createFields={[{ key: "scope_type", label: "Scope Type" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
