import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Security Incidents"
      eyebrow="staff \u00b7 security_audit_incidents"
      endpoint="/api/staff/security-audit/incidents"
      columns={[{"key": "incident_code", "label": "Incident Code"}, {"key": "incident_type", "label": "Incident Type"}, {"key": "severity", "label": "Severity"}, {"key": "affected_modules", "label": "Affected Modules"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="security_audit_incidents"
      createFields={[{ key: "incident_type", label: "Incident Type" }, { key: "severity", label: "Severity" }, { key: "affected_modules", label: "Affected Modules" }, { key: "related_event_ids", label: "Related Event Ids" }, { key: "summary", label: "Summary" }, { key: "opened_at", label: "Opened At" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "open", "label": "Open"}, {"value": "triaged", "label": "Triaged"}, {"value": "contained", "label": "Contained"}, {"value": "remediated", "label": "Remediated"}, {"value": "closed", "label": "Closed"}, {"value": "reopened", "label": "Reopened"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
