import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Security & Audit"
      eyebrow="staff \u00b7 security_audit_console"
      endpoint="/api/staff/security-audit"
      columns={[{"key": "audit_event_code", "label": "Audit Event"}, {"key": "source_module", "label": "Source Module"}, {"key": "event_type", "label": "Event Type"}, {"key": "entity_type", "label": "Entity Type"}, {"key": "status", "label": "Status"}]}
      description="Review security incidents and verify audit-log integrity."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Security Audit"}]}
      nextAction="\u2192 Use \u201cNew Security & Audit\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="security_audit_console"
      createFields={[{"key": "source_module", "label": "Source Module", "type": "text"}, {"key": "event_type", "label": "Event Type", "type": "text"}, {"key": "entity_type", "label": "Entity Type", "type": "text"}, {"key": "entity_id", "label": "Entity", "type": "text"}, {"key": "actor_id", "label": "Actor", "type": "reference", "refTable": "staff_profiles"}, {"key": "action", "label": "Action", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
    />
  );
}
