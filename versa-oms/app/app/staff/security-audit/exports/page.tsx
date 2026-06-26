import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Exports"
      eyebrow="staff \u00b7 audit_exports_review"
      endpoint="/api/staff/security-audit/exports"
      columns={[{"key": "export_code", "label": "Export"}, {"key": "export_scope", "label": "Export Scope"}, {"key": "reason", "label": "Reason"}, {"key": "expires_at", "label": "Expires At"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_exports_review"
      createFields={[{"key": "export_scope", "label": "Export Scope", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "expires_at", "label": "Expires At", "type": "date"}]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "generate", "label": "Generate", "variant": "light"}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "requested", "label": "Requested"}, {"value": "approved", "label": "Approved"}, {"value": "generated", "label": "Generated"}, {"value": "downloaded", "label": "Downloaded"}, {"value": "expired", "label": "Expired"}, {"value": "rejected", "label": "Rejected"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
