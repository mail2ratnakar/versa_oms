import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Notification Batches"
      eyebrow="staff \u00b7 notification_ops_batches"
      endpoint="/api/staff/notifications/batches"
      columns={[{"key": "batch_code", "label": "Batch Code"}, {"key": "batch_type", "label": "Batch Type"}, {"key": "source_module", "label": "Source Module"}, {"key": "source_entity_type", "label": "Source Entity Type"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="notification_ops_batches"
      createFields={[{ key: "batch_type", label: "Batch Type" }, { key: "recipient_scope_snapshot", label: "Recipient Scope Snapshot" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "recipients", "label": "Recipients", "subPath": "recipients", "listColumns": ["recipient_status", "recipient_key", "recipient_type", "channel_address"]}, {"key": "messages", "label": "Messages", "subPath": "messages", "listColumns": ["message_status", "message_code", "rendered_subject", "rendered_body"]}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "dry_run", "label": "Dry Run"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "queued", "label": "Queued"}, {"value": "sending", "label": "Sending"}, {"value": "sent", "label": "Sent"}, {"value": "partially_failed", "label": "Partially Failed"}, {"value": "failed", "label": "Failed"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
