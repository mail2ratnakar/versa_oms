import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Result Publications"
      eyebrow="staff \u00b7 results_publications"
      endpoint="/api/staff/results/publications"
      columns={[{"key": "publication_code", "label": "Publication"}, {"key": "grade", "label": "Grade"}, {"key": "scope_type", "label": "Scope Type"}, {"key": "scope_value", "label": "Scope Value"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results_publications"
      createFields={[{"key": "olympiad_id", "label": "Olympiad", "type": "reference", "refTable": "olympiads"}, {"key": "grade", "label": "Grade", "type": "text"}, {"key": "scope_type", "label": "Scope Type", "type": "select", "options": [{"value": "all", "label": "All"}, {"value": "grade", "label": "Grade"}, {"value": "school", "label": "School"}, {"value": "participation", "label": "Participation"}]}, {"key": "scope_value", "label": "Scope Value", "type": "text"}, {"key": "publication_version", "label": "Publication Version", "type": "number"}, {"key": "scheduled_publish_at", "label": "Scheduled Publish At", "type": "date"}, {"key": "published_at", "label": "Published At", "type": "date"}, {"key": "approved_at", "label": "Approved At", "type": "date"}, {"key": "publication_notes", "label": "Publication Notes", "type": "text"}]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "draft", "label": "Draft"}, {"value": "ready_for_review", "label": "Ready For Review"}, {"value": "approved", "label": "Approved"}, {"value": "scheduled", "label": "Scheduled"}, {"value": "published", "label": "Published"}, {"value": "paused", "label": "Paused"}, {"value": "revoked", "label": "Revoked"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
