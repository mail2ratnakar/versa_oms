import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Admin Settings"
      eyebrow="staff \u00b7 admin_settings"
      endpoint="/api/staff/admin/settings"
      columns={[{"key": "group_code", "label": "Group"}, {"key": "group_name", "label": "Group Name"}, {"key": "owner_module", "label": "Owner Module"}, {"key": "owner_role", "label": "Owner Role"}, {"key": "group_status", "label": "Status"}]}
      description="Propose and govern setting changes through maker-checker approval."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Admin", "href": "/staff/admin"}, {"label": "Settings"}]}
      nextAction="\u2192 Use \u201cNew Admin Setting\u201d to add one, then act on it from the list."
      statusKey="group_status"
      moduleId="admin_settings"
      createFields={[{"key": "group_name", "label": "Group Name", "type": "text"}, {"key": "owner_module", "label": "Owner Module", "type": "text"}, {"key": "owner_role", "label": "Owner Role", "type": "text"}, {"key": "classification", "label": "Classification", "type": "select", "options": [{"value": "internal", "label": "Internal"}, {"value": "sensitive", "label": "Sensitive"}, {"value": "restricted", "label": "Restricted"}]}]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "definitions", "label": "Definitions", "subPath": "definitions", "listColumns": ["definition_status", "setting_key", "setting_name", "value_schema"]}]}
      toolbar={{"facet": {"key": "group_status", "options": [{"value": "active", "label": "Active"}, {"value": "inactive", "label": "Inactive"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
