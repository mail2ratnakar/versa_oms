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
      actions={[{"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "publication_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "scheduled", "label": "Scheduled"}, {"value": "published", "label": "Published"}, {"value": "paused", "label": "Paused"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
