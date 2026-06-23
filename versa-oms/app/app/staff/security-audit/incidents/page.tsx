import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Security Incidents"
      eyebrow="staff \u00b7 security_audit_incidents"
      endpoint="/api/staff/security-audit/incidents"
      columns={[{"key": "incident_code", "label": "incident code"}, {"key": "incident_type", "label": "incident type"}, {"key": "severity", "label": "severity"}, {"key": "affected_modules", "label": "affected modules"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="security_audit_incidents"
      createFields={[{ key: "incident_type", label: "Incident type" }, { key: "severity", label: "Severity" }, { key: "affected_modules", label: "Affected modules" }, { key: "related_event_ids", label: "Related event ids" }, { key: "summary", label: "Summary" }, { key: "opened_at", label: "Opened at" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
