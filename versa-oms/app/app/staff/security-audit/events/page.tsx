import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Events"
      eyebrow="staff \u00b7 audit_events_review"
      endpoint="/api/staff/security-audit/events"
      columns={[{"key": "trace_id", "label": "Trace ID"}, {"key": "actor_role", "label": "Actor Role"}, {"key": "action", "label": "Action"}, {"key": "entity_name", "label": "Entity Name"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_events_review"
      createFields={[{ key: "trace_id", label: "Trace ID" }, { key: "actor_role", label: "Actor Role" }, { key: "action", label: "Action" }, { key: "entity_name", label: "Entity Name" }, { key: "entity_id", label: "Entity ID" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
