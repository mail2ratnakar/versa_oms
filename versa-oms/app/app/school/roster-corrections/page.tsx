import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roster Corrections"
      eyebrow="school \u00b7 school_roster_corrections"
      endpoint="/api/school/roster-corrections"
      columns={[{"key": "correction_code", "label": "correction code"}, {"key": "correction_type", "label": "correction type"}, {"key": "requested_change", "label": "requested change"}, {"key": "reason", "label": "reason"}, {"key": "correction_status", "label": "Status"}]}
      statusKey="correction_status"
      moduleId="school_roster_corrections"
      createFields={[{ key: "roster_batch_id", label: "Roster batch" }, { key: "correction_type", label: "Correction type" }, { key: "requested_change", label: "Requested change" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "blue"}]}
    />
  );
}
