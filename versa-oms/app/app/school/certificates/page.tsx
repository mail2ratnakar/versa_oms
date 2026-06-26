import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates"
      eyebrow="school \u00b7 school_certificates"
      endpoint="/api/school/certificates"
      columns={[{"key": "certificate_number", "label": "Certificate Number"}, {"key": "verification_code", "label": "Verification"}, {"key": "certificate_type", "label": "Certificate Type"}, {"key": "issued_at", "label": "Issued At"}, {"key": "status", "label": "Status"}]}
      description="Manage and review certificates across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Certificates"}]}
      statusKey="status"
      moduleId="school_certificates"
      downloadAction={{"label": "Download certificate", "subPath": "file"}}
    />
  );
}
