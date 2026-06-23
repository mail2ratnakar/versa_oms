import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Setting Versions"
      eyebrow="staff \u00b7 admin_settings_versions"
      endpoint="/api/staff/admin/settings/versions"
      columns={[{"key": "setting_key", "label": "setting key"}, {"key": "setting_version", "label": "setting version"}, {"key": "setting_value", "label": "setting value"}, {"key": "value_hash", "label": "value hash"}, {"key": "version_status", "label": "Status"}]}
      statusKey="version_status"
      moduleId="admin_settings_versions"
      createFields={[{ key: "setting_key", label: "Setting key" }, { key: "setting_version", label: "Setting version" }, { key: "setting_value", label: "Setting value" }, { key: "value_hash", label: "Value hash" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
