import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roster Corrections"
      eyebrow="school \u00b7 school_roster_corrections"
      endpoint="/api/school/roster-corrections"
      columns={[{"key": "correction_code", "label": "Correction"}, {"key": "correction_type", "label": "Correction Type"}, {"key": "requested_change", "label": "Requested Change"}, {"key": "reason", "label": "Reason"}, {"key": "correction_status", "label": "Status"}]}
      description="Manage and review roster corrections across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Roster Corrections"}]}
      nextAction="\u2192 Use \u201cNew Roster Correction\u201d to add one, then act on it from the list."
      statusKey="correction_status"
      moduleId="school_roster_corrections"
      createFields={[{"key": "roster_batch_id", "label": "Roster batch", "type": "text"}, {"key": "correction_type", "label": "Correction type", "type": "text"}, {"key": "requested_change", "label": "Requested change", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "blue"}]}
    />
  );
}
