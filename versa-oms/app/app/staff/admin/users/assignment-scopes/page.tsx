import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Assignment Scopes"
      eyebrow="staff \u00b7 staff_users_assignment_scopes"
      endpoint="/api/staff/admin/users/assignment-scopes"
      columns={[{"key": "scope_type", "label": "scope type"}, {"key": "scope_value", "label": "scope value"}, {"key": "scope_label", "label": "scope label"}, {"key": "starts_at", "label": "starts at"}, {"key": "scope_status", "label": "Status"}]}
      statusKey="scope_status"
      moduleId="staff_users_assignment_scopes"
      createFields={[{ key: "scope_type", label: "Scope type" }, { key: "scope_value", label: "Scope value" }]}
      actions={[{"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
