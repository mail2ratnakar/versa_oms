import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Notification Batches"
      eyebrow="staff \u00b7 notification_ops_batches"
      endpoint="/api/staff/notifications/batches"
      columns={[{"key": "batch_code", "label": "Batch"}, {"key": "batch_type", "label": "Batch Type"}, {"key": "source_module", "label": "Source Module"}, {"key": "source_entity_type", "label": "Source Entity Type"}, {"key": "batch_status", "label": "Status"}]}
      description="Manage and review notification batches across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Notifications", "href": "/staff/notifications"}, {"label": "Batches"}]}
      nextAction="\u2192 Use \u201cNew Notification Batche\u201d to add one, then act on it from the list."
      statusKey="batch_status"
      moduleId="notification_ops_batches"
      createFields={[{"key": "batch_type", "label": "Batch Type", "type": "select", "options": [{"value": "event_triggered", "label": "Event Triggered"}, {"value": "manual_single", "label": "Manual Single"}, {"value": "bulk_announcement", "label": "Bulk Announcement"}, {"value": "system_alert", "label": "System Alert"}, {"value": "retry_batch", "label": "Retry Batch"}]}, {"key": "source_module", "label": "Source Module", "type": "text"}, {"key": "source_entity_type", "label": "Source Entity Type", "type": "text"}, {"key": "source_entity_id", "label": "Source Entity", "type": "text"}, {"key": "template_id", "label": "Template", "type": "reference", "refTable": "notification_templates"}, {"key": "priority", "label": "Priority", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "normal", "label": "Normal"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "dry_run_report", "label": "Dry Run Report", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "retire", "label": "Retire", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "recipients", "label": "Recipients", "subPath": "recipients", "listColumns": ["recipient_status", "recipient_key", "recipient_type", "channel_address"]}, {"key": "messages", "label": "Messages", "subPath": "messages", "listColumns": ["message_status", "message_code", "rendered_subject", "rendered_body"]}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "dry_run", "label": "Dry Run"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "queued", "label": "Queued"}, {"value": "sending", "label": "Sending"}, {"value": "sent", "label": "Sent"}, {"value": "partially_failed", "label": "Partially Failed"}, {"value": "failed", "label": "Failed"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
