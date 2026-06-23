import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Materials"
      eyebrow="school \u00b7 school_materials"
      endpoint="/api/school/materials"
      columns={[{"key": "package_code", "label": "package code"}, {"key": "content_set_code", "label": "content set code"}, {"key": "content_set_version", "label": "content set version"}, {"key": "template_version", "label": "template version"}, {"key": "package_status", "label": "Status"}]}
      statusKey="package_status"
    />
  );
}
