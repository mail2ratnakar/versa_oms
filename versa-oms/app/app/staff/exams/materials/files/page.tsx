import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Material Files"
      eyebrow="staff \u00b7 exam_material_ops_files"
      endpoint="/api/staff/exams/materials/files"
      columns={[{"key": "file_code", "label": "file code"}, {"key": "file_type", "label": "file type"}, {"key": "file_ref", "label": "file ref"}, {"key": "file_hash", "label": "file hash"}, {"key": "file_status", "label": "Status"}]}
      statusKey="file_status"
      moduleId="exam_material_ops_files"
      createFields={[{ key: "file_type", label: "File type" }, { key: "file_ref", label: "File ref" }, { key: "file_hash", label: "File hash" }, { key: "file_size_bytes", label: "File size bytes", type: "number" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "release", "label": "Release", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
