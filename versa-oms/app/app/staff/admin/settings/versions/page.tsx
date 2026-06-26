import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Setting Versions"
      eyebrow="staff \u00b7 admin_settings_versions"
      endpoint="/api/staff/admin/settings/versions"
      columns={[{"key": "setting_key", "label": "Setting Key"}, {"key": "setting_version", "label": "Setting Version"}, {"key": "setting_value", "label": "Setting Value"}, {"key": "effective_from", "label": "Effective From"}, {"key": "version_status", "label": "Status"}]}
      statusKey="version_status"
      moduleId="admin_settings_versions"
      createFields={[{"key": "setting_key", "label": "Setting Key", "type": "text"}, {"key": "setting_version", "label": "Setting Version", "type": "text"}, {"key": "setting_value", "label": "Setting Value", "type": "text"}, {"key": "effective_from", "label": "Effective From", "type": "date"}, {"key": "effective_to", "label": "Effective To", "type": "date"}, {"key": "activation_scope", "label": "Activation Scope", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "change-requests", "label": "Change Requests", "subPath": "change-requests", "listColumns": ["request_status", "change_request_code", "change_type", "reason"]}, {"key": "activation-events", "label": "Activation Events", "subPath": "activation-events", "listColumns": ["event_code", "reason", "metadata", "created_at"]}]}
      toolbar={{"facet": {"key": "version_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "scheduled", "label": "Scheduled"}, {"value": "active", "label": "Active"}, {"value": "superseded", "label": "Superseded"}, {"value": "rolled_back", "label": "Rolled Back"}, {"value": "rejected", "label": "Rejected"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
