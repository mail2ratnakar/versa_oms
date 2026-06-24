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
      createFields={[{ key: "email", label: "Email" }, { key: "full_name", label: "Full Name" }, { key: "department", label: "Department" }, { key: "primary_role", label: "Primary Role" }, { key: "invitation_token_hash", label: "Invitation Token Hash" }, { key: "expires_at", label: "Expires At" }]}
      actions={[{"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
