import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Material Approvals"
      eyebrow="staff \u00b7 exam_material_ops_approvals"
      endpoint="/api/staff/exams/materials/approvals"
      columns={[{"key": "approval_code", "label": "approval code"}, {"key": "approval_type", "label": "approval type"}, {"key": "approval_level", "label": "approval level"}, {"key": "reason", "label": "reason"}, {"key": "approval_status", "label": "Status"}]}
      statusKey="approval_status"
      moduleId="exam_material_ops_approvals"
      createFields={[{ key: "approval_type", label: "Approval type" }, { key: "approval_level", label: "Approval level" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
