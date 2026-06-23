import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates (core)"
      eyebrow="staff \u00b7 core_certificates"
      endpoint="/api/staff/core/certificates"
      columns={[{"key": "certificate_number", "label": "certificate number"}, {"key": "verification_code", "label": "verification code"}, {"key": "certificate_type", "label": "certificate type"}, {"key": "pdf_file", "label": "pdf file"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "certificate_number", label: "Certificate number" }, { key: "revocation_reason", label: "Revocation reason" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
