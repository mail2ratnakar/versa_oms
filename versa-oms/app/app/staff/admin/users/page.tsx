import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Staff Users"
      eyebrow="staff \u00b7 staff_users"
      endpoint="/api/staff/admin/users"
      columns={[{"key": "staff_code", "label": "Staff Code"}, {"key": "full_name", "label": "Full Name"}, {"key": "display_name", "label": "Display Name"}, {"key": "email", "label": "Email"}, {"key": "staff_status", "label": "Status"}]}
      statusKey="staff_status"
      moduleId="staff_users"
      createFields={[{ key: "full_name", label: "Full Name" }, { key: "email", label: "Email" }, { key: "department", label: "Department" }, { key: "primary_role", label: "Primary Role" }, { key: "employment_type", label: "Employment Type" }, { key: "joining_date", label: "Joining Date", type: "date" }]}
      actions={[{"action": "suspend", "label": "Suspend", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "invitations", "label": "Invitations", "subPath": "invitations", "listColumns": ["invitation_status", "invitation_code", "email", "full_name"]}, {"key": "assignment-scopes", "label": "Assignment Scopes", "subPath": "assignment-scopes", "listColumns": ["scope_status", "scope_type", "scope_value", "scope_label"]}, {"key": "access-events", "label": "Access Events", "subPath": "access-events", "listColumns": ["event_code", "event_source", "previous_status", "new_status"]}]}
      toolbar={{"facet": {"key": "staff_status", "options": [{"value": "invited", "label": "Invited"}, {"value": "active", "label": "Active"}, {"value": "suspended", "label": "Suspended"}, {"value": "disabled", "label": "Disabled"}, {"value": "exited", "label": "Exited"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
