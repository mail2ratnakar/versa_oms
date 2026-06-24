import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Admin Settings"
      eyebrow="staff \u00b7 admin_settings"
      endpoint="/api/staff/admin/settings"
      columns={[{"key": "group_code", "label": "Group Code"}, {"key": "group_name", "label": "Group Name"}, {"key": "owner_module", "label": "Owner Module"}, {"key": "owner_role", "label": "Owner Role"}, {"key": "group_status", "label": "Status"}]}
      statusKey="group_status"
      moduleId="admin_settings"
      createFields={[{ key: "group_name", label: "Group Name" }, { key: "owner_module", label: "Owner Module" }, { key: "owner_role", label: "Owner Role" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "definitions", "label": "Definitions", "subPath": "definitions", "listColumns": ["definition_status", "setting_key", "setting_name", "value_schema"]}]}
      toolbar={{"facet": {"key": "group_status", "options": [{"value": "active", "label": "Active"}, {"value": "inactive", "label": "Inactive"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
