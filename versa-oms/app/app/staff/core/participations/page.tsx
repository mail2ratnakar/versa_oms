import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Participations"
      eyebrow="staff \u00b7 core_participations"
      endpoint="/api/staff/core/participations"
      columns={[{"key": "participation_code", "label": "Participation Code"}, {"key": "gross_amount", "label": "Gross Amount"}, {"key": "commission_amount", "label": "Commission Amount"}, {"key": "net_amount_payable", "label": "Net Amount Payable"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="schools"
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
