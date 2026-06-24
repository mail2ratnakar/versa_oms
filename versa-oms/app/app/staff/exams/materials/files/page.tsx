import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Material Files"
      eyebrow="staff \u00b7 exam_material_ops_files"
      endpoint="/api/staff/exams/materials/files"
      columns={[{"key": "file_code", "label": "File Code"}, {"key": "file_type", "label": "File Type"}, {"key": "file_ref", "label": "File Ref"}, {"key": "file_hash", "label": "File Hash"}, {"key": "file_status", "label": "Status"}]}
      statusKey="file_status"
      moduleId="exam_material_ops_files"
      createFields={[{ key: "file_type", label: "File Type" }, { key: "file_ref", label: "File Ref" }, { key: "file_hash", label: "File Hash" }, { key: "file_size_bytes", label: "File Size Bytes", type: "number" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "release", "label": "Release", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
