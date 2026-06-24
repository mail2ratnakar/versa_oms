import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Notifications"
      eyebrow="staff \u00b7 notification_ops"
      endpoint="/api/staff/notifications"
      columns={[{"key": "template_code", "label": "Template Code"}, {"key": "event_code", "label": "Event Code"}, {"key": "channel", "label": "Channel"}, {"key": "locale", "label": "Locale"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="notification_ops"
      createFields={[{ key: "channel", label: "Channel" }, { key: "body_template", label: "Body Template" }, { key: "required_variables", label: "Required Variables" }, { key: "allowed_recipient_roles", label: "Allowed Recipient Roles" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
