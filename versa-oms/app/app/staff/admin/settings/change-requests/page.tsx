import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Setting Change Requests"
      eyebrow="staff \u00b7 admin_settings_change_requests"
      endpoint="/api/staff/admin/settings/change-requests"
      columns={[{"key": "change_request_code", "label": "Change Request Code"}, {"key": "change_type", "label": "Change Type"}, {"key": "reason", "label": "Reason"}, {"key": "impact_summary", "label": "Impact Summary"}, {"key": "request_status", "label": "Status"}]}
      statusKey="request_status"
      moduleId="admin_settings_change_requests"
      createFields={[{ key: "change_type", label: "Change Type" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "request_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "expired", "label": "Expired"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
