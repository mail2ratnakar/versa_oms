import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Assignment Scopes"
      eyebrow="staff \u00b7 staff_users_assignment_scopes"
      endpoint="/api/staff/admin/users/assignment-scopes"
      columns={[{"key": "scope_type", "label": "Scope Type"}, {"key": "scope_value", "label": "Scope Value"}, {"key": "scope_label", "label": "Scope Label"}, {"key": "starts_at", "label": "Starts At"}, {"key": "scope_status", "label": "Status"}]}
      statusKey="scope_status"
      moduleId="staff_users_assignment_scopes"
      createFields={[{ key: "scope_type", label: "Scope Type" }, { key: "scope_value", label: "Scope Value" }]}
      actions={[{"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
