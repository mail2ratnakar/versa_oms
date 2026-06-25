import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates"
      eyebrow="school \u00b7 school_certificates"
      endpoint="/api/school/certificates"
      columns={[{"key": "certificate_number", "label": "Certificate Number"}, {"key": "verification_code", "label": "Verification Code"}, {"key": "certificate_type", "label": "Certificate Type"}, {"key": "pdf_file", "label": "PDF File"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="school_certificates"
      downloadAction={{"label": "Download certificate", "subPath": "file"}}
    />
  );
}
