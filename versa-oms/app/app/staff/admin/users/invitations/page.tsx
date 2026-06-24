import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Staff Invitations"
      eyebrow="staff \u00b7 staff_users_invitations"
      endpoint="/api/staff/admin/users/invitations"
      columns={[{"key": "invitation_code", "label": "Invitation Code"}, {"key": "email", "label": "Email"}, {"key": "full_name", "label": "Full Name"}, {"key": "department", "label": "Department"}, {"key": "invitation_status", "label": "Status"}]}
      statusKey="invitation_status"
      moduleId="staff_users_invitations"
      createFields={[{ key: "email", label: "Email" }, { key: "full_name", label: "Full Name" }, { key: "department", label: "Department" }, { key: "primary_role", label: "Primary Role" }, { key: "expires_at", label: "Expires At" }]}
      actions={[{"action": "accept", "label": "Accept", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "invitation_status", "options": [{"value": "pending", "label": "Pending"}, {"value": "accepted", "label": "Accepted"}, {"value": "expired", "label": "Expired"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "resent", "label": "Resent"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
