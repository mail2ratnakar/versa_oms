import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Forensics Cases"
      eyebrow="staff \u00b7 security_audit_forensics"
      endpoint="/api/staff/security-audit/forensics"
      columns={[{"key": "case_code", "label": "Case"}, {"key": "case_title", "label": "Case Title"}, {"key": "case_summary", "label": "Case Summary"}, {"key": "findings_summary", "label": "Findings Summary"}, {"key": "case_status", "label": "Status"}]}
      description="Manage and review forensics cases across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Security Audit", "href": "/staff/security-audit"}, {"label": "Forensics"}]}
      nextAction="\u2192 Use \u201cNew Forensics Case\u201d to add one, then act on it from the list."
      statusKey="case_status"
      moduleId="security_audit_forensics"
      createFields={[{"key": "case_title", "label": "Case Title", "type": "text"}, {"key": "linked_incident_id", "label": "Linked Incident", "type": "reference", "refTable": "security_incidents"}, {"key": "case_owner_id", "label": "Case Owner", "type": "reference", "refTable": "staff_profiles"}, {"key": "case_summary", "label": "Case Summary", "type": "text"}, {"key": "findings_summary", "label": "Findings Summary", "type": "text"}]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "case_status", "options": [{"value": "open", "label": "Open"}, {"value": "collecting_evidence", "label": "Collecting Evidence"}, {"value": "analysis", "label": "Analysis"}, {"value": "findings_ready", "label": "Findings Ready"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
