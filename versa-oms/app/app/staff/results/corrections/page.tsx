import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Result Corrections"
      eyebrow="staff \u00b7 results_ops_corrections"
      endpoint="/api/staff/results/corrections"
      columns={[{"key": "correction_code", "label": "Correction"}, {"key": "correction_type", "label": "Correction Type"}, {"key": "previous_values", "label": "Previous Values"}, {"key": "new_values", "label": "New Values"}, {"key": "status", "label": "Status"}]}
      description="Manage and review result corrections across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Results", "href": "/staff/results"}, {"label": "Corrections"}]}
      nextAction="\u2192 Use \u201cNew Result Correction\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="results_ops_corrections"
      createFields={[{"key": "result_id", "label": "Result", "type": "reference", "refTable": "results"}, {"key": "correction_type", "label": "Correction Type", "type": "select", "options": [{"value": "score_recalculation", "label": "Score Recalculation"}, {"value": "candidate_mapping_fix", "label": "Candidate Mapping Fix"}, {"value": "answer_key_revision", "label": "Answer Key Revision"}, {"value": "withhold", "label": "Withhold"}, {"value": "unwithhold", "label": "Unwithhold"}, {"value": "rank_recalculation", "label": "Rank Recalculation"}, {"value": "publication_error", "label": "Publication Error"}]}, {"key": "previous_values", "label": "Previous Values", "type": "text"}, {"key": "new_values", "label": "New Values", "type": "text"}, {"key": "reason", "label": "Reason", "type": "text"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
