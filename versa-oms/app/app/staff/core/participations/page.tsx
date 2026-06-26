import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Participations"
      eyebrow="staff \u00b7 core_participations"
      endpoint="/api/staff/core/participations"
      columns={[{"key": "participation_code", "label": "Participation"}, {"key": "gross_amount", "label": "Gross Amount"}, {"key": "commission_amount", "label": "Commission Amount"}, {"key": "net_amount_payable", "label": "Net Amount Payable"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="schools"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "olympiad_id", "label": "Olympiad", "type": "reference", "refTable": "olympiads"}, {"key": "gross_amount", "label": "Gross Amount", "type": "number"}, {"key": "commission_amount", "label": "Commission Amount", "type": "number"}, {"key": "net_amount_payable", "label": "Net Amount Payable", "type": "number"}, {"key": "exam_slot_id", "label": "Exam Slot", "type": "reference", "refTable": "exam_slots"}, {"key": "locked_at", "label": "Locked At", "type": "date"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
