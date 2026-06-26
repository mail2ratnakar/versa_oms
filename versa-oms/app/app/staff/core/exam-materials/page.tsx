import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam materials (core)"
      eyebrow="staff \u00b7 core_exam_materials"
      endpoint="/api/staff/core/exam-materials"
      columns={[{"key": "material_code", "label": "Material"}, {"key": "material_type", "label": "Material Type"}, {"key": "file", "label": "File"}, {"key": "release_at", "label": "Release At"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="exam_materials"
      createFields={[{"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "olympiad_id", "label": "Olympiad", "type": "reference", "refTable": "olympiads"}, {"key": "exam_slot_id", "label": "Exam Slot", "type": "reference", "refTable": "exam_slots"}, {"key": "material_type", "label": "Material Type", "type": "text"}, {"key": "file", "label": "File", "type": "text"}, {"key": "release_at", "label": "Release At", "type": "date"}, {"key": "expires_at", "label": "Expires At", "type": "date"}]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "release", "label": "Release", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
