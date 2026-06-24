import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Setting Versions"
      eyebrow="staff \u00b7 admin_settings_versions"
      endpoint="/api/staff/admin/settings/versions"
      columns={[{"key": "setting_key", "label": "Setting Key"}, {"key": "setting_version", "label": "Setting Version"}, {"key": "setting_value", "label": "Setting Value"}, {"key": "value_hash", "label": "Value Hash"}, {"key": "version_status", "label": "Status"}]}
      statusKey="version_status"
      moduleId="admin_settings_versions"
      createFields={[{ key: "setting_key", label: "Setting Key" }, { key: "setting_version", label: "Setting Version" }, { key: "setting_value", label: "Setting Value" }, { key: "value_hash", label: "Value Hash" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
