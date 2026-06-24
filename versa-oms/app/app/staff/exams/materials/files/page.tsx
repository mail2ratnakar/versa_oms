import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Material Files"
      eyebrow="staff \u00b7 exam_material_ops_files"
      endpoint="/api/staff/exams/materials/files"
      columns={[{"key": "file_code", "label": "File Code"}, {"key": "file_type", "label": "File Type"}, {"key": "file_ref", "label": "File Ref"}, {"key": "file_size_bytes", "label": "File Size Bytes"}, {"key": "file_status", "label": "Status"}]}
      statusKey="file_status"
      moduleId="exam_material_ops_files"
      createFields={[{ key: "file_type", label: "File Type" }, { key: "file_ref", label: "File Ref" }, { key: "file_size_bytes", label: "File Size Bytes", type: "number" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "release", "label": "Release", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "download-events", "label": "Download Events", "subPath": "download-events", "listColumns": ["event_code", "ip_address", "device_fingerprint", "reason"]}]}
      toolbar={{"facet": {"key": "file_status", "options": [{"value": "generated", "label": "Generated"}, {"value": "approved", "label": "Approved"}, {"value": "released", "label": "Released"}, {"value": "revoked", "label": "Revoked"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
