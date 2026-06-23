import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Export Requests"
      eyebrow="staff \u00b7 reports_exports_requests"
      endpoint="/api/staff/reports/export-requests"
      columns={[{"key": "export_code", "label": "export code"}, {"key": "requested_format", "label": "requested format"}, {"key": "filter_payload", "label": "filter payload"}, {"key": "filter_hash", "label": "filter hash"}, {"key": "export_status", "label": "Status"}]}
      statusKey="export_status"
      moduleId="reports_exports_requests"
      createFields={[{ key: "requested_format", label: "Requested format" }, { key: "filter_payload", label: "Filter payload" }, { key: "filter_hash", label: "Filter hash" }, { key: "reason", label: "Reason" }, { key: "sensitivity_level", label: "Sensitivity level" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "generate", "label": "Generate", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
