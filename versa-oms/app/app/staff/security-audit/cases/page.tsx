import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Cases"
      eyebrow="staff \u00b7 audit_cases"
      endpoint="/api/staff/security-audit/cases"
      columns={[{"key": "case_code", "label": "Case"}, {"key": "case_type", "label": "Case Type"}, {"key": "title", "label": "Title"}, {"key": "description", "label": "Description"}, {"key": "status", "label": "Status"}]}
      description="Manage and review audit cases across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Security Audit", "href": "/staff/security-audit"}, {"label": "Cases"}]}
      nextAction="\u2192 Use \u201cNew Audit Case\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="audit_cases"
      createFields={[{"key": "case_type", "label": "Case Type", "type": "select", "options": [{"value": "access_review", "label": "Access Review"}, {"value": "data_change_review", "label": "Data Change Review"}, {"value": "payment_exception", "label": "Payment Exception"}, {"value": "result_correction", "label": "Result Correction"}, {"value": "security_review", "label": "Security Review"}, {"value": "operations_exception", "label": "Operations Exception"}, {"value": "incident_followup", "label": "Incident Followup"}]}, {"key": "title", "label": "Title", "type": "text"}, {"key": "description", "label": "Description", "type": "text"}, {"key": "related_event_ids", "label": "Related Event Ids", "type": "text"}, {"key": "source_modules", "label": "Source Modules", "type": "text"}, {"key": "risk_level", "label": "Risk Level", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "assigned_to", "label": "Assigned To", "type": "reference", "refTable": "staff_profiles"}, {"key": "resolution_note", "label": "Resolution Note", "type": "text"}, {"key": "opened_at", "label": "Opened At", "type": "date"}, {"key": "closed_at", "label": "Closed At", "type": "date"}]}
      actions={[{"action": "resolve", "label": "Resolve", "variant": "blue"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "reopen", "label": "Reopen", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "open", "label": "Open"}, {"value": "in_review", "label": "In Review"}, {"value": "waiting_for_input", "label": "Waiting For Input"}, {"value": "resolved", "label": "Resolved"}, {"value": "closed", "label": "Closed"}, {"value": "reopened", "label": "Reopened"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
