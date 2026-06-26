import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Notifications"
      eyebrow="staff \u00b7 notification_ops"
      endpoint="/api/staff/notifications"
      columns={[{"key": "template_code", "label": "Template"}, {"key": "event_code", "label": "Event"}, {"key": "channel", "label": "Channel"}, {"key": "locale", "label": "Locale"}, {"key": "status", "label": "Status"}]}
      description="Compose, approve and send notifications from governed templates."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Notifications"}]}
      nextAction="\u2192 Use \u201cNew Notification\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="notification_ops"
      createFields={[{"key": "event_code", "label": "Event", "type": "text"}, {"key": "channel", "label": "Channel", "type": "select", "options": [{"value": "email", "label": "Email"}, {"value": "sms", "label": "SMS"}, {"value": "whatsapp", "label": "Whatsapp"}, {"value": "in_app", "label": "In App"}]}, {"key": "locale", "label": "Locale", "type": "text"}, {"key": "subject_template", "label": "Subject Template", "type": "text"}, {"key": "body_template", "label": "Body Template", "type": "text"}, {"key": "required_variables", "label": "Required Variables", "type": "text"}, {"key": "allowed_recipient_roles", "label": "Allowed Recipient Roles", "type": "text"}, {"key": "provider_template_id", "label": "Provider Template", "type": "text"}, {"key": "approved_at", "label": "Approved At", "type": "date"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "retire", "label": "Retire", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "deliveries", "label": "Deliveries", "subPath": "deliveries", "listColumns": ["status", "delivery_code", "recipient_role", "recipient_name"]}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "draft", "label": "Draft"}, {"value": "approved", "label": "Approved"}, {"value": "active", "label": "Active"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
