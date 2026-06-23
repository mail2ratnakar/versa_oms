import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reports & Exports"
      eyebrow="staff \u00b7 reports_exports"
      endpoint="/api/staff/reports"
      columns={[{"key": "report_code", "label": "report code"}, {"key": "report_name", "label": "report name"}, {"key": "report_category", "label": "report category"}, {"key": "source_modules", "label": "source modules"}, {"key": "report_status", "label": "Status"}]}
      statusKey="report_status"
      createFields={[{ key: "report_name", label: "Report name" }, { key: "report_category", label: "Report category" }, { key: "source_modules", label: "Source modules" }, { key: "filter_schema", label: "Filter schema" }, { key: "column_schema", label: "Column schema" }, { key: "report_version", label: "Report version" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
