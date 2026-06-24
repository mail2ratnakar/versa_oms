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
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
