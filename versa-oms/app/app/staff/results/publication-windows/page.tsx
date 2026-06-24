import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Publication Windows"
      eyebrow="staff \u00b7 results_ops_publication_windows"
      endpoint="/api/staff/results/publication-windows"
      columns={[{"key": "publication_code", "label": "Publication Code"}, {"key": "target_visibility", "label": "Target Visibility"}, {"key": "publish_at", "label": "Publish At"}, {"key": "reason", "label": "Reason"}, {"key": "publication_status", "label": "Status"}]}
      statusKey="publication_status"
      moduleId="results_ops_publication_windows"
      createFields={[{ key: "target_visibility", label: "Target Visibility" }]}
      actions={[{"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
