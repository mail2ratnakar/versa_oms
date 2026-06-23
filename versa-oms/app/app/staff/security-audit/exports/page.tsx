import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Exports"
      eyebrow="staff \u00b7 audit_exports_review"
      endpoint="/api/staff/security-audit/exports"
      columns={[{"key": "export_code", "label": "export code"}, {"key": "export_scope", "label": "export scope"}, {"key": "reason", "label": "reason"}, {"key": "export_file", "label": "export file"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_exports_review"
      createFields={[{ key: "export_scope", label: "Export scope" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "generate", "label": "Generate", "variant": "light"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
