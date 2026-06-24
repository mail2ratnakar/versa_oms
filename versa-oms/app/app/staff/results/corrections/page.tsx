import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Result Corrections"
      eyebrow="staff \u00b7 results_ops_corrections"
      endpoint="/api/staff/results/corrections"
      columns={[{"key": "correction_code", "label": "Correction Code"}, {"key": "correction_type", "label": "Correction Type"}, {"key": "previous_values", "label": "Previous Values"}, {"key": "new_values", "label": "New Values"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results_ops_corrections"
      createFields={[{ key: "correction_type", label: "Correction Type" }, { key: "previous_values", label: "Previous Values" }, { key: "new_values", label: "New Values" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
