import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Notification Batches"
      eyebrow="staff \u00b7 notification_ops_batches"
      endpoint="/api/staff/notifications/batches"
      columns={[{"key": "batch_code", "label": "batch code"}, {"key": "batch_type", "label": "batch type"}, {"key": "source_module", "label": "source module"}, {"key": "source_entity_type", "label": "source entity type"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="notification_ops_batches"
      createFields={[{ key: "batch_type", label: "Batch type" }, { key: "recipient_scope_snapshot", label: "Recipient scope snapshot" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
