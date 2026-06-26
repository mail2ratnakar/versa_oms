import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Security Incidents"
      eyebrow="staff \u00b7 security_audit_incidents"
      endpoint="/api/staff/security-audit/incidents"
      columns={[{"key": "incident_code", "label": "Incident"}, {"key": "incident_type", "label": "Incident Type"}, {"key": "severity", "label": "Severity"}, {"key": "affected_modules", "label": "Affected Modules"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="security_audit_incidents"
      createFields={[{"key": "incident_type", "label": "Incident Type", "type": "select", "options": [{"value": "unauthorized_access", "label": "Unauthorized Access"}, {"value": "data_exposure", "label": "Data Exposure"}, {"value": "payment_issue", "label": "Payment Issue"}, {"value": "result_publication_issue", "label": "Result Publication Issue"}, {"value": "certificate_issue", "label": "Certificate Issue"}, {"value": "file_leak", "label": "File Leak"}, {"value": "provider_webhook_issue", "label": "Provider Webhook Issue"}, {"value": "system_misconfiguration", "label": "System Misconfiguration"}, {"value": "other", "label": "Other"}]}, {"key": "severity", "label": "Severity", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "affected_modules", "label": "Affected Modules", "type": "text"}, {"key": "affected_school_ids", "label": "Affected School Ids", "type": "text"}, {"key": "related_event_ids", "label": "Related Event Ids", "type": "text"}, {"key": "summary", "label": "Summary", "type": "text"}, {"key": "containment_action", "label": "Containment Action", "type": "text"}, {"key": "root_cause", "label": "Root Cause", "type": "text"}, {"key": "remediation_action", "label": "Remediation Action", "type": "text"}, {"key": "owner", "label": "Owner", "type": "reference", "refTable": "staff_profiles"}, {"key": "opened_at", "label": "Opened At", "type": "date"}, {"key": "closed_at", "label": "Closed At", "type": "date"}]}
      actions={[{"action": "resolve", "label": "Resolve", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "open", "label": "Open"}, {"value": "triaged", "label": "Triaged"}, {"value": "contained", "label": "Contained"}, {"value": "remediated", "label": "Remediated"}, {"value": "closed", "label": "Closed"}, {"value": "reopened", "label": "Reopened"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
