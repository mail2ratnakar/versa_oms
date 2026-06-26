import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Events"
      eyebrow="staff \u00b7 audit_events_review"
      endpoint="/api/staff/security-audit/events"
      columns={[{"key": "actor_role", "label": "Actor Role"}, {"key": "action", "label": "Action"}, {"key": "entity_name", "label": "Entity Name"}, {"key": "entity_id", "label": "Entity"}, {"key": "status", "label": "Status"}]}
      description="Manage and review audit events across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Security Audit", "href": "/staff/security-audit"}, {"label": "Events"}]}
      nextAction="\u2192 Use \u201cNew Audit Event\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="audit_events_review"
      createFields={[{"key": "actor_user_id", "label": "Actor User", "type": "reference", "refTable": "staff_profiles"}, {"key": "actor_role", "label": "Actor Role", "type": "text"}, {"key": "action", "label": "Action", "type": "text"}, {"key": "entity_name", "label": "Entity Name", "type": "text"}, {"key": "entity_id", "label": "Entity", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
