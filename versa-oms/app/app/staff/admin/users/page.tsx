import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Staff Users"
      eyebrow="staff \u00b7 staff_users"
      endpoint="/api/staff/admin/users"
      columns={[{"key": "staff_code", "label": "Staff"}, {"key": "full_name", "label": "Full Name"}, {"key": "display_name", "label": "Display Name"}, {"key": "email", "label": "Email"}, {"key": "staff_status", "label": "Status"}]}
      description="Invite, scope and manage staff accounts and their access."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Admin", "href": "/staff/admin"}, {"label": "Users"}]}
      nextAction="\u2192 Use \u201cNew Staff User\u201d to add one, then act on it from the list."
      statusKey="staff_status"
      moduleId="staff_users"
      createFields={[{"key": "full_name", "label": "Full Name", "type": "text"}, {"key": "display_name", "label": "Display Name", "type": "text"}, {"key": "email", "label": "Email", "type": "text"}, {"key": "mobile", "label": "Mobile", "type": "text"}, {"key": "department", "label": "Department", "type": "select", "options": [{"value": "leadership", "label": "Leadership"}, {"value": "operations", "label": "Operations"}, {"value": "sales", "label": "Sales"}, {"value": "onboarding", "label": "Onboarding"}, {"value": "finance", "label": "Finance"}, {"value": "exam_operations", "label": "Exam Operations"}, {"value": "content", "label": "Content"}, {"value": "materials", "label": "Materials"}, {"value": "courier", "label": "Courier"}, {"value": "evaluation", "label": "Evaluation"}, {"value": "results", "label": "Results"}, {"value": "certificates", "label": "Certificates"}, {"value": "communications", "label": "Communications"}, {"value": "support", "label": "Support"}, {"value": "security", "label": "Security"}, {"value": "audit", "label": "Audit"}, {"value": "system", "label": "System"}]}, {"key": "primary_role", "label": "Primary Role", "type": "text"}, {"key": "secondary_roles", "label": "Secondary Roles", "type": "text"}, {"key": "reporting_manager_id", "label": "Reporting Manager", "type": "reference", "refTable": "staff_profiles"}, {"key": "employment_type", "label": "Employment Type", "type": "select", "options": [{"value": "full_time", "label": "Full Time"}, {"value": "part_time", "label": "Part Time"}, {"value": "contract", "label": "Contract"}, {"value": "consultant", "label": "Consultant"}, {"value": "temporary", "label": "Temporary"}, {"value": "system_service", "label": "System Service"}]}, {"key": "location", "label": "Location", "type": "text"}, {"key": "timezone", "label": "Timezone", "type": "text"}, {"key": "joining_date", "label": "Joining Date", "type": "date"}, {"key": "exit_date", "label": "Exit Date", "type": "date"}, {"key": "last_login_at", "label": "Last Login At", "type": "date"}, {"key": "last_failed_login_at", "label": "Last Failed Login At", "type": "date"}, {"key": "disable_reason", "label": "Disable Reason", "type": "text"}, {"key": "notes", "label": "Notes", "type": "text"}]}
      actions={[{"action": "suspend", "label": "Suspend", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "invitations", "label": "Invitations", "subPath": "invitations", "listColumns": ["invitation_status", "invitation_code", "email", "full_name"]}, {"key": "assignment-scopes", "label": "Assignment Scopes", "subPath": "assignment-scopes", "listColumns": ["scope_status", "scope_type", "scope_value", "scope_label"]}, {"key": "access-events", "label": "Access Events", "subPath": "access-events", "listColumns": ["event_code", "event_source", "previous_status", "new_status"]}]}
      toolbar={{"facet": {"key": "staff_status", "options": [{"value": "invited", "label": "Invited"}, {"value": "active", "label": "Active"}, {"value": "suspended", "label": "Suspended"}, {"value": "disabled", "label": "Disabled"}, {"value": "exited", "label": "Exited"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
