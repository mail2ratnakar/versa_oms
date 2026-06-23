import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roster Corrections"
      eyebrow="staff \u00b7 student_roster_ops_corrections"
      endpoint="/api/staff/students/rosters/corrections"
      columns={[{"key": "correction_code", "label": "correction code"}, {"key": "correction_type", "label": "correction type"}, {"key": "requested_change", "label": "requested change"}, {"key": "reason", "label": "reason"}, {"key": "correction_status", "label": "Status"}]}
      statusKey="correction_status"
      moduleId="student_roster_ops_corrections"
      createFields={[{ key: "correction_type", label: "Correction type" }, { key: "requested_change", label: "Requested change" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
