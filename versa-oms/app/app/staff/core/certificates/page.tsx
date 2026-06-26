import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates (core)"
      eyebrow="staff \u00b7 core_certificates"
      endpoint="/api/staff/core/certificates"
      columns={[{"key": "certificate_number", "label": "Certificate Number"}, {"key": "verification_code", "label": "Verification"}, {"key": "certificate_type", "label": "Certificate Type"}, {"key": "issued_at", "label": "Issued At"}, {"key": "status", "label": "Status"}]}
      description="Manage and review certificates (core) across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Core", "href": "/staff/core"}, {"label": "Certificates"}]}
      nextAction="\u2192 Use \u201cNew Certificates (core)\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="certificates"
      createFields={[{"key": "student_id", "label": "Student", "type": "reference", "refTable": "students"}, {"key": "result_id", "label": "Result", "type": "reference", "refTable": "results"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "certificate_type", "label": "Certificate Type", "type": "text"}, {"key": "issued_at", "label": "Issued At", "type": "date"}, {"key": "revoked_at", "label": "Revoked At", "type": "date"}, {"key": "revocation_reason", "label": "Revocation Reason", "type": "text"}]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      downloadAction={{"label": "Download PDF", "subPath": "file"}}
    />
  );
}
