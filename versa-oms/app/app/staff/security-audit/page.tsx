import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Security & Audit"
      eyebrow="staff \u00b7 security_audit_console"
      endpoint="/api/staff/security-audit"
      columns={[{"key": "audit_event_code", "label": "audit event code"}, {"key": "source_module", "label": "source module"}, {"key": "event_type", "label": "event type"}, {"key": "entity_type", "label": "entity type"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "source_module", label: "Source module" }, { key: "event_type", label: "Event type" }, { key: "entity_type", label: "Entity type" }, { key: "action", label: "Action" }, { key: "event_hash", label: "Event hash" }]}
    />
  );
}
