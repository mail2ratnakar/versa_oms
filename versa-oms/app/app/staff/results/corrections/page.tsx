import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Result Corrections"
      eyebrow="staff \u00b7 results_ops_corrections"
      endpoint="/api/staff/results/corrections"
      columns={[{"key": "correction_code", "label": "correction code"}, {"key": "correction_type", "label": "correction type"}, {"key": "previous_values", "label": "previous values"}, {"key": "new_values", "label": "new values"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results_ops_corrections"
      createFields={[{ key: "correction_type", label: "Correction type" }, { key: "previous_values", label: "Previous values" }, { key: "new_values", label: "New values" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
