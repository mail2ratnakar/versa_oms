import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Events"
      eyebrow="staff \u00b7 audit_events_review"
      endpoint="/api/staff/security-audit/events"
      columns={[{"key": "trace_id", "label": "trace id"}, {"key": "actor_role", "label": "actor role"}, {"key": "action", "label": "action"}, {"key": "entity_name", "label": "entity name"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_events_review"
      createFields={[{ key: "trace_id", label: "Trace id" }, { key: "actor_role", label: "Actor role" }, { key: "action", label: "Action" }, { key: "entity_name", label: "Entity name" }, { key: "entity_id", label: "Entity id" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
