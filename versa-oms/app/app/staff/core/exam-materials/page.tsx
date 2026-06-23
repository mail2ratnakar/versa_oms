import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam materials (core)"
      eyebrow="staff \u00b7 core_exam_materials"
      endpoint="/api/staff/core/exam-materials"
      columns={[{"key": "material_code", "label": "material code"}, {"key": "material_type", "label": "material type"}, {"key": "file", "label": "file"}, {"key": "release_at", "label": "release at"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "file", label: "File" }, { key: "release_at", label: "Release at" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "release", "label": "Release", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
