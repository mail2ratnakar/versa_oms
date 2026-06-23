import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Result Publications"
      eyebrow="staff \u00b7 results_publications"
      endpoint="/api/staff/results/publications"
      columns={[{"key": "publication_code", "label": "publication code"}, {"key": "grade", "label": "grade"}, {"key": "scope_type", "label": "scope type"}, {"key": "scope_value", "label": "scope value"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results_publications"
      createFields={[{ key: "scope_type", label: "Scope type" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
