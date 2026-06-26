import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Role Change Requests"
      eyebrow="staff \u00b7 roles_permissions_change_requests"
      endpoint="/api/staff/admin/roles/change-requests"
      columns={[{"key": "request_code", "label": "Request"}, {"key": "request_type", "label": "Request Type"}, {"key": "target_module_id", "label": "Target Module"}, {"key": "proposed_change", "label": "Proposed Change"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="roles_permissions_change_requests"
      createFields={[{"key": "request_type", "label": "Request Type", "type": "select", "options": [{"value": "new_role", "label": "New Role"}, {"value": "role_update", "label": "Role Update"}, {"value": "role_disable", "label": "Role Disable"}, {"value": "permission_add", "label": "Permission Add"}, {"value": "permission_remove", "label": "Permission Remove"}, {"value": "permission_update", "label": "Permission Update"}, {"value": "scope_policy_change", "label": "Scope Policy Change"}, {"value": "approval_matrix_change", "label": "Approval Matrix Change"}]}, {"key": "target_role_id", "label": "Target Role", "type": "reference", "refTable": "portal_roles"}, {"key": "target_module_id", "label": "Target Module", "type": "text"}, {"key": "proposed_change", "label": "Proposed Change", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
