import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Staff Invitations"
      eyebrow="staff \u00b7 staff_users_invitations"
      endpoint="/api/staff/admin/users/invitations"
      columns={[{"key": "invitation_code", "label": "invitation code"}, {"key": "email", "label": "email"}, {"key": "full_name", "label": "full name"}, {"key": "department", "label": "department"}, {"key": "invitation_status", "label": "Status"}]}
      statusKey="invitation_status"
      moduleId="staff_users_invitations"
      createFields={[{ key: "email", label: "Email" }, { key: "full_name", label: "Full name" }, { key: "department", label: "Department" }, { key: "primary_role", label: "Primary role" }, { key: "invitation_token_hash", label: "Invitation token hash" }, { key: "expires_at", label: "Expires at" }]}
      actions={[{"action": "cancel", "label": "Cancel", "variant": "light"}]}
    />
  );
}
