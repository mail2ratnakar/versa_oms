import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates"
      eyebrow="staff \u00b7 certificate_ops"
      endpoint="/api/staff/certificates"
      columns={[{"key": "template_code", "label": "template code"}, {"key": "template_name", "label": "template name"}, {"key": "certificate_type", "label": "certificate type"}, {"key": "template_file", "label": "template file"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "template_name", label: "Template name" }, { key: "certificate_type", label: "Certificate type" }, { key: "template_config", label: "Template config" }, { key: "required_merge_fields", label: "Required merge fields" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
