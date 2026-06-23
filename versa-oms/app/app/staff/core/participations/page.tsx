import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Participations"
      eyebrow="staff \u00b7 core_participations"
      endpoint="/api/staff/core/participations"
      columns={[{"key": "participation_code", "label": "participation code"}, {"key": "gross_amount", "label": "gross amount"}, {"key": "commission_amount", "label": "commission amount"}, {"key": "net_amount_payable", "label": "net amount payable"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="schools"
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "block", "label": "Block", "variant": "light"}]}
    />
  );
}
