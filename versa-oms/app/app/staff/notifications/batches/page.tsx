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
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
