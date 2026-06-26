import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Publication Windows"
      eyebrow="staff \u00b7 results_ops_publication_windows"
      endpoint="/api/staff/results/publication-windows"
      columns={[{"key": "publication_code", "label": "Publication"}, {"key": "target_visibility", "label": "Target Visibility"}, {"key": "publish_at", "label": "Publish At"}, {"key": "reason", "label": "Reason"}, {"key": "publication_status", "label": "Status"}]}
      statusKey="publication_status"
      moduleId="results_ops_publication_windows"
      createFields={[{"key": "result_batch_id", "label": "Result Batch", "type": "reference", "refTable": "result_batches"}, {"key": "target_visibility", "label": "Target Visibility", "type": "select", "options": [{"value": "staff_only", "label": "Staff Only"}, {"value": "school_portal", "label": "School Portal"}, {"value": "parent_student_portal_later", "label": "Parent Student Portal Later"}, {"value": "public_lookup_later", "label": "Public Lookup Later"}]}, {"key": "publish_at", "label": "Publish At", "type": "date"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "publication_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "scheduled", "label": "Scheduled"}, {"value": "published", "label": "Published"}, {"value": "paused", "label": "Paused"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
