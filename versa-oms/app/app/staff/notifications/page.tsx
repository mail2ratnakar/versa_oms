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
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "retire", "label": "Retire", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "deliveries", "label": "Deliveries", "subPath": "deliveries", "listColumns": ["status", "delivery_code", "recipient_role", "recipient_name"]}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "draft", "label": "Draft"}, {"value": "approved", "label": "Approved"}, {"value": "active", "label": "Active"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
