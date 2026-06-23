import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Escalations"
      eyebrow="staff \u00b7 support_tickets_escalations"
      endpoint="/api/staff/support/escalations"
      columns={[{"key": "escalation_code", "label": "escalation code"}, {"key": "escalation_level", "label": "escalation level"}, {"key": "target_module", "label": "target module"}, {"key": "reason", "label": "reason"}, {"key": "escalation_status", "label": "Status"}]}
      statusKey="escalation_status"
      moduleId="support_tickets_escalations"
      createFields={[{ key: "escalation_level", label: "Escalation level" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "reject", "label": "Reject", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
