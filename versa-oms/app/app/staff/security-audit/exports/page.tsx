import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Exports"
      eyebrow="staff \u00b7 audit_exports_review"
      endpoint="/api/staff/security-audit/exports"
      columns={[{"key": "export_code", "label": "Export Code"}, {"key": "export_scope", "label": "Export Scope"}, {"key": "reason", "label": "Reason"}, {"key": "export_file", "label": "Export File"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_exports_review"
      createFields={[{ key: "export_scope", label: "Export Scope" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "generate", "label": "Generate", "variant": "light"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "requested", "label": "Requested"}, {"value": "approved", "label": "Approved"}, {"value": "generated", "label": "Generated"}, {"value": "downloaded", "label": "Downloaded"}, {"value": "expired", "label": "Expired"}, {"value": "rejected", "label": "Rejected"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
