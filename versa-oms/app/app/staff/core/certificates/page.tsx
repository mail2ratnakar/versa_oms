import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates (core)"
      eyebrow="staff \u00b7 core_certificates"
      endpoint="/api/staff/core/certificates"
      columns={[{"key": "certificate_number", "label": "Certificate Number"}, {"key": "verification_code", "label": "Verification Code"}, {"key": "certificate_type", "label": "Certificate Type"}, {"key": "pdf_file", "label": "PDF File"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="certificates"
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
