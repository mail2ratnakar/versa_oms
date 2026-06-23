import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Materials"
      eyebrow="staff \u00b7 exam_material_ops"
      endpoint="/api/staff/exams/materials"
      columns={[{"key": "template_code", "label": "template code"}, {"key": "template_name", "label": "template name"}, {"key": "template_type", "label": "template type"}, {"key": "template_version", "label": "template version"}, {"key": "template_status", "label": "Status"}]}
      statusKey="template_status"
      moduleId="exam_material_ops"
      createFields={[{ key: "template_name", label: "Template name" }, { key: "template_type", label: "Template type" }, { key: "template_version", label: "Template version" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
