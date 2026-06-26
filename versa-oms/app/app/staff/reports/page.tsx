import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reports & Exports"
      eyebrow="staff \u00b7 reports_exports"
      endpoint="/api/staff/reports"
      columns={[{"key": "report_code", "label": "Report"}, {"key": "report_name", "label": "Report Name"}, {"key": "report_category", "label": "Report Category"}, {"key": "source_modules", "label": "Source Modules"}, {"key": "report_status", "label": "Status"}]}
      statusKey="report_status"
      moduleId="reports_exports"
      createFields={[{"key": "report_name", "label": "Report Name", "type": "text"}, {"key": "report_category", "label": "Report Category", "type": "select", "options": [{"value": "school", "label": "School"}, {"value": "finance", "label": "Finance"}, {"value": "student", "label": "Student"}, {"value": "exam", "label": "Exam"}, {"value": "material", "label": "Material"}, {"value": "courier", "label": "Courier"}, {"value": "evaluation", "label": "Evaluation"}, {"value": "results", "label": "Results"}, {"value": "certificates", "label": "Certificates"}, {"value": "notifications", "label": "Notifications"}, {"value": "support", "label": "Support"}, {"value": "tasks", "label": "Tasks"}, {"value": "audit_security", "label": "Audit Security"}, {"value": "cross_module", "label": "Cross Module"}]}, {"key": "source_modules", "label": "Source Modules", "type": "text"}, {"key": "filter_schema", "label": "Filter Schema", "type": "text"}, {"key": "column_schema", "label": "Column Schema", "type": "text"}, {"key": "classification", "label": "Classification", "type": "select", "options": [{"value": "internal", "label": "Internal"}, {"value": "sensitive", "label": "Sensitive"}, {"value": "restricted", "label": "Restricted"}]}, {"key": "report_version", "label": "Report Version", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "retire", "label": "Retire", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "export-requests", "label": "Export Requests", "subPath": "export-requests", "listColumns": ["export_status", "export_code", "requested_format", "filter_payload"]}, {"key": "snapshots", "label": "Snapshots", "subPath": "snapshots", "listColumns": ["snapshot_status", "snapshot_code", "report_version", "source_schema_versions"]}]}
      toolbar={{"facet": {"key": "report_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "active", "label": "Active"}, {"value": "retired", "label": "Retired"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
