import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roles & Permissions"
      eyebrow="staff \u00b7 roles_permissions"
      endpoint="/api/staff/admin/roles"
      columns={[{"key": "role_id", "label": "Role ID"}, {"key": "role_name", "label": "Role Name"}, {"key": "description", "label": "Description"}, {"key": "department", "label": "Department"}, {"key": "role_status", "label": "Status"}]}
      statusKey="role_status"
      moduleId="roles_permissions"
      createFields={[{ key: "role_id", label: "Role ID" }, { key: "role_name", label: "Role Name" }, { key: "department", label: "Department" }, { key: "risk_level", label: "Risk Level" }, { key: "scope_model", label: "Scope Model" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
