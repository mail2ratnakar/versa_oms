import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Role Change Requests"
      eyebrow="staff \u00b7 roles_permissions_change_requests"
      endpoint="/api/staff/admin/roles/change-requests"
      columns={[{"key": "request_code", "label": "Request Code"}, {"key": "request_type", "label": "Request Type"}, {"key": "target_module_id", "label": "Target Module ID"}, {"key": "proposed_change", "label": "Proposed Change"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="roles_permissions_change_requests"
      createFields={[{ key: "request_type", label: "Request Type" }, { key: "proposed_change", label: "Proposed Change" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
