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
      createFields={[{"key": "staff_profile_id", "label": "Staff Profile", "type": "reference", "refTable": "staff_profiles"}, {"key": "scope_type", "label": "Scope Type", "type": "select", "options": [{"value": "global", "label": "Global"}, {"value": "department", "label": "Department"}, {"value": "region", "label": "Region"}, {"value": "state", "label": "State"}, {"value": "school", "label": "School"}, {"value": "olympiad", "label": "Olympiad"}, {"value": "exam_cycle", "label": "Exam Cycle"}, {"value": "work_queue", "label": "Work Queue"}]}, {"key": "scope_value", "label": "Scope Value", "type": "text"}, {"key": "scope_label", "label": "Scope Label", "type": "text"}, {"key": "starts_at", "label": "Starts At", "type": "date"}, {"key": "ends_at", "label": "Ends At", "type": "date"}, {"key": "assignment_reason", "label": "Assignment Reason", "type": "text"}]}
      actions={[{"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "scope_status", "options": [{"value": "active", "label": "Active"}, {"value": "paused", "label": "Paused"}, {"value": "expired", "label": "Expired"}, {"value": "revoked", "label": "Revoked"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
