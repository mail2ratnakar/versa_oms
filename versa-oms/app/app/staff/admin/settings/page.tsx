import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Admin Settings"
      eyebrow="staff \u00b7 admin_settings"
      endpoint="/api/staff/admin/settings"
      columns={[{"key": "group_code", "label": "group code"}, {"key": "group_name", "label": "group name"}, {"key": "owner_module", "label": "owner module"}, {"key": "owner_role", "label": "owner role"}, {"key": "group_status", "label": "Status"}]}
      statusKey="group_status"
      createFields={[{ key: "group_name", label: "Group name" }, { key: "owner_module", label: "Owner module" }, { key: "owner_role", label: "Owner role" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
