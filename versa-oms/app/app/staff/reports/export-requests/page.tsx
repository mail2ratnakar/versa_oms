import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Export Requests"
      eyebrow="staff \u00b7 reports_exports_requests"
      endpoint="/api/staff/reports/export-requests"
      columns={[{"key": "export_code", "label": "Export Code"}, {"key": "requested_format", "label": "Requested Format"}, {"key": "filter_payload", "label": "Filter Payload"}, {"key": "reason", "label": "Reason"}, {"key": "export_status", "label": "Status"}]}
      statusKey="export_status"
      moduleId="reports_exports_requests"
      createFields={[{ key: "requested_format", label: "Requested Format" }, { key: "filter_payload", label: "Filter Payload" }, { key: "reason", label: "Reason" }, { key: "sensitivity_level", label: "Sensitivity Level" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "generate", "label": "Generate", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "export_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "queued", "label": "Queued"}, {"value": "generating", "label": "Generating"}, {"value": "generated", "label": "Generated"}, {"value": "failed", "label": "Failed"}, {"value": "expired", "label": "Expired"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
