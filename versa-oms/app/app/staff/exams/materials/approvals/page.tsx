import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Material Approvals"
      eyebrow="staff \u00b7 exam_material_ops_approvals"
      endpoint="/api/staff/exams/materials/approvals"
      columns={[{"key": "approval_code", "label": "Approval"}, {"key": "approval_type", "label": "Approval Type"}, {"key": "approval_level", "label": "Approval Level"}, {"key": "reason", "label": "Reason"}, {"key": "approval_status", "label": "Status"}]}
      statusKey="approval_status"
      moduleId="exam_material_ops_approvals"
      createFields={[{"key": "material_package_id", "label": "Material Package", "type": "reference", "refTable": "exam_material_packages"}, {"key": "approval_type", "label": "Approval Type", "type": "select", "options": [{"value": "generation_review", "label": "Generation Review"}, {"value": "question_paper_release", "label": "Question Paper Release"}, {"value": "replacement", "label": "Replacement"}, {"value": "revocation", "label": "Revocation"}, {"value": "release_override", "label": "Release Override"}, {"value": "bulk_download_export", "label": "Bulk Download Export"}]}, {"key": "approval_level", "label": "Approval Level", "type": "select", "options": [{"value": "single", "label": "Single"}, {"value": "dual_first", "label": "Dual First"}, {"value": "dual_final", "label": "Dual Final"}]}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "approved_at", "label": "Approved At", "type": "date"}]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "approval_status", "options": [{"value": "pending", "label": "Pending"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "expired", "label": "Expired"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
