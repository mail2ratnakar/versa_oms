import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Setting Change Requests"
      eyebrow="staff \u00b7 admin_settings_change_requests"
      endpoint="/api/staff/admin/settings/change-requests"
      columns={[{"key": "change_request_code", "label": "change request code"}, {"key": "change_type", "label": "change type"}, {"key": "reason", "label": "reason"}, {"key": "impact_summary", "label": "impact summary"}, {"key": "request_status", "label": "Status"}]}
      statusKey="request_status"
      moduleId="admin_settings_change_requests"
      createFields={[{ key: "change_type", label: "Change type" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
