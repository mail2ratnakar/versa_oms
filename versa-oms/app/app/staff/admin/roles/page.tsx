import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roles & Permissions"
      eyebrow="staff \u00b7 roles_permissions"
      endpoint="/api/staff/admin/roles"
      columns={[{"key": "role_id", "label": "Role"}, {"key": "role_name", "label": "Role Name"}, {"key": "description", "label": "Description"}, {"key": "department", "label": "Department"}, {"key": "role_status", "label": "Status"}]}
      statusKey="role_status"
      moduleId="roles_permissions"
      createFields={[{"key": "role_id", "label": "Role", "type": "text"}, {"key": "role_name", "label": "Role Name", "type": "text"}, {"key": "description", "label": "Description", "type": "text"}, {"key": "department", "label": "Department", "type": "text"}, {"key": "risk_level", "label": "Risk Level", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "scope_model", "label": "Scope Model", "type": "text"}, {"key": "directus_role_id", "label": "Directus Role", "type": "reference", "refTable": "portal_roles"}, {"key": "is_system_role", "label": "Is System Role", "type": "checkbox"}, {"key": "custom_role_allowed", "label": "Custom Role Allowed", "type": "checkbox"}]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "permission-rules", "label": "Permission Rules", "subPath": "permission-rules", "listColumns": ["rule_status", "collection_name", "action", "is_allowed"]}, {"key": "role-change-requests", "label": "Role Change Requests", "subPath": "role-change-requests", "listColumns": ["status", "request_code", "request_type", "proposed_change"]}]}
      toolbar={{"facet": {"key": "role_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "active", "label": "Active"}, {"value": "deprecated", "label": "Deprecated"}, {"value": "disabled", "label": "Disabled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
