import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roles & Permissions"
      eyebrow="staff \u00b7 roles_permissions"
      endpoint="/api/staff/admin/roles"
      columns={[{"key": "role_id", "label": "role id"}, {"key": "role_name", "label": "role name"}, {"key": "description", "label": "description"}, {"key": "department", "label": "department"}, {"key": "role_status", "label": "Status"}]}
      statusKey="role_status"
      createFields={[{ key: "role_id", label: "Role id" }, { key: "role_name", label: "Role name" }, { key: "department", label: "Department" }, { key: "risk_level", label: "Risk level" }, { key: "scope_model", label: "Scope model" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
