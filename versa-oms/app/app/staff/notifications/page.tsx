import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Notifications"
      eyebrow="staff \u00b7 notification_ops"
      endpoint="/api/staff/notifications"
      columns={[{"key": "template_code", "label": "template code"}, {"key": "event_code", "label": "event code"}, {"key": "channel", "label": "channel"}, {"key": "locale", "label": "locale"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="notification_ops"
      createFields={[{ key: "channel", label: "Channel" }, { key: "body_template", label: "Body template" }, { key: "required_variables", label: "Required variables" }, { key: "allowed_recipient_roles", label: "Allowed recipient roles" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
