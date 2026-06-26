import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Setting Change Requests"
      eyebrow="staff \u00b7 admin_settings_change_requests"
      endpoint="/api/staff/admin/settings/change-requests"
      columns={[{"key": "change_request_code", "label": "Change Request"}, {"key": "change_type", "label": "Change Type"}, {"key": "reason", "label": "Reason"}, {"key": "impact_summary", "label": "Impact Summary"}, {"key": "request_status", "label": "Status"}]}
      description="Manage and review setting change requests across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Admin", "href": "/staff/admin"}, {"label": "Settings", "href": "/staff/admin/settings"}, {"label": "Change Requests"}]}
      nextAction="\u2192 Use \u201cNew Setting Change Request\u201d to add one, then act on it from the list."
      statusKey="request_status"
      moduleId="admin_settings_change_requests"
      createFields={[{"key": "setting_version_id", "label": "Setting Version", "type": "reference", "refTable": "setting_versions"}, {"key": "change_type", "label": "Change Type", "type": "select", "options": [{"value": "create", "label": "Create"}, {"value": "update", "label": "Update"}, {"value": "activate", "label": "Activate"}, {"value": "rollback", "label": "Rollback"}, {"value": "retire", "label": "Retire"}, {"value": "secret_reference_update", "label": "Secret Reference Update"}, {"value": "hard_delete_exception", "label": "Hard Delete Exception"}]}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "impact_summary", "label": "Impact Summary", "type": "text"}, {"key": "rollback_plan", "label": "Rollback Plan", "type": "text"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "request_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "expired", "label": "Expired"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
