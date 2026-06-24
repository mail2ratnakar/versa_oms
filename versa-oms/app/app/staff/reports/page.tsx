import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reports & Exports"
      eyebrow="staff \u00b7 reports_exports"
      endpoint="/api/staff/reports"
      columns={[{"key": "report_code", "label": "Report Code"}, {"key": "report_name", "label": "Report Name"}, {"key": "report_category", "label": "Report Category"}, {"key": "source_modules", "label": "Source Modules"}, {"key": "report_status", "label": "Status"}]}
      statusKey="report_status"
      moduleId="reports_exports"
      createFields={[{ key: "report_name", label: "Report Name" }, { key: "report_category", label: "Report Category" }, { key: "source_modules", label: "Source Modules" }, { key: "filter_schema", label: "Filter Schema" }, { key: "column_schema", label: "Column Schema" }, { key: "report_version", label: "Report Version" }]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "retire", "label": "Retire", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "export-requests", "label": "Export Requests", "subPath": "export-requests", "listColumns": ["export_status", "export_code", "requested_format", "filter_payload"]}, {"key": "snapshots", "label": "Snapshots", "subPath": "snapshots", "listColumns": ["snapshot_status", "snapshot_code", "report_version", "source_schema_versions"]}]}
      toolbar={{"facet": {"key": "report_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "active", "label": "Active"}, {"value": "retired", "label": "Retired"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
