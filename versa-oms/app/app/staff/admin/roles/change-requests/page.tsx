import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Role Change Requests"
      eyebrow="staff \u00b7 roles_permissions_change_requests"
      endpoint="/api/staff/admin/roles/change-requests"
      columns={[{"key": "request_code", "label": "request code"}, {"key": "request_type", "label": "request type"}, {"key": "target_module_id", "label": "target module id"}, {"key": "proposed_change", "label": "proposed change"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="roles_permissions_change_requests"
      createFields={[{ key: "request_type", label: "Request type" }, { key: "proposed_change", label: "Proposed change" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
