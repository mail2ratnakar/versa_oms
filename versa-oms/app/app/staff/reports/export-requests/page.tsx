import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Export Requests"
      eyebrow="staff \u00b7 reports_exports_requests"
      endpoint="/api/staff/reports/export-requests"
      columns={[{"key": "export_code", "label": "Export"}, {"key": "requested_format", "label": "Requested Format"}, {"key": "reason", "label": "Reason"}, {"key": "sensitivity_level", "label": "Sensitivity Level"}, {"key": "export_status", "label": "Status"}]}
      statusKey="export_status"
      moduleId="reports_exports_requests"
      createFields={[{"key": "report_definition_id", "label": "Report Definition", "type": "reference", "refTable": "report_definitions"}, {"key": "requested_format", "label": "Requested Format", "type": "select", "options": [{"value": "csv", "label": "CSV"}, {"value": "xlsx", "label": "Xlsx"}, {"value": "pdf_later", "label": "PDF Later"}]}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "sensitivity_level", "label": "Sensitivity Level", "type": "select", "options": [{"value": "internal", "label": "Internal"}, {"value": "sensitive", "label": "Sensitive"}, {"value": "restricted", "label": "Restricted"}]}, {"key": "requires_approval", "label": "Requires Approval", "type": "checkbox"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "generate", "label": "Generate", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "report-snapshots", "label": "Report Snapshots", "subPath": "report-snapshots", "listColumns": ["snapshot_status", "snapshot_code", "report_version", "source_schema_versions"]}, {"key": "files", "label": "Files", "subPath": "files", "listColumns": ["file_status", "file_code", "file_format", "watermark_payload"]}]}
      toolbar={{"facet": {"key": "export_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "queued", "label": "Queued"}, {"value": "generating", "label": "Generating"}, {"value": "generated", "label": "Generated"}, {"value": "failed", "label": "Failed"}, {"value": "expired", "label": "Expired"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
