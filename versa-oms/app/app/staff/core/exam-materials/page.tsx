import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam materials (core)"
      eyebrow="staff \u00b7 core_exam_materials"
      endpoint="/api/staff/core/exam-materials"
      columns={[{"key": "material_code", "label": "Material Code"}, {"key": "material_type", "label": "Material Type"}, {"key": "file", "label": "File"}, {"key": "release_at", "label": "Release At"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="exam_materials"
      createFields={[{ key: "file", label: "File" }, { key: "release_at", label: "Release At" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "release", "label": "Release", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
