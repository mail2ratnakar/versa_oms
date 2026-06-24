import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Material Approvals"
      eyebrow="staff \u00b7 exam_material_ops_approvals"
      endpoint="/api/staff/exams/materials/approvals"
      columns={[{"key": "approval_code", "label": "Approval Code"}, {"key": "approval_type", "label": "Approval Type"}, {"key": "approval_level", "label": "Approval Level"}, {"key": "reason", "label": "Reason"}, {"key": "approval_status", "label": "Status"}]}
      statusKey="approval_status"
      moduleId="exam_material_ops_approvals"
      createFields={[{ key: "approval_type", label: "Approval Type" }, { key: "approval_level", label: "Approval Level" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "approval_status", "options": [{"value": "pending", "label": "Pending"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "expired", "label": "Expired"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
