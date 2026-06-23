import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates"
      eyebrow="school \u00b7 school_certificates"
      endpoint="/api/school/certificates"
      columns={[{"key": "certificate_number", "label": "certificate number"}, {"key": "verification_code", "label": "verification code"}, {"key": "certificate_type", "label": "certificate type"}, {"key": "pdf_file", "label": "pdf file"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
    />
  );
}
