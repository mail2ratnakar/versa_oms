import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificates"
      eyebrow="staff \u00b7 certificate_ops"
      endpoint="/api/staff/certificates"
      columns={[{"key": "template_code", "label": "Template Code"}, {"key": "template_name", "label": "Template Name"}, {"key": "certificate_type", "label": "Certificate Type"}, {"key": "template_file", "label": "Template File"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="certificate_ops"
      createFields={[{ key: "template_name", label: "Template Name" }, { key: "certificate_type", label: "Certificate Type" }, { key: "template_config", label: "Template Config" }, { key: "required_merge_fields", label: "Required Merge Fields" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
