import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Materials"
      eyebrow="school \u00b7 school_materials"
      endpoint="/api/school/materials"
      columns={[{"key": "package_code", "label": "Package Code"}, {"key": "content_set_code", "label": "Content Set Code"}, {"key": "content_set_version", "label": "Content Set Version"}, {"key": "template_version", "label": "Template Version"}, {"key": "package_status", "label": "Status"}]}
      statusKey="package_status"
      moduleId="school_materials"
    />
  );
}
