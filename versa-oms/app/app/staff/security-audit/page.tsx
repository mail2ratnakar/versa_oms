import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Security & Audit"
      eyebrow="staff \u00b7 security_audit_console"
      endpoint="/api/staff/security-audit"
      columns={[{"key": "audit_event_code", "label": "Audit Event Code"}, {"key": "source_module", "label": "Source Module"}, {"key": "event_type", "label": "Event Type"}, {"key": "entity_type", "label": "Entity Type"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="security_audit_console"
      createFields={[{ key: "source_module", label: "Source Module" }, { key: "event_type", label: "Event Type" }, { key: "entity_type", label: "Entity Type" }, { key: "action", label: "Action" }]}
    />
  );
}
