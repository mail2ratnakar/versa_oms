import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Score Batches"
      eyebrow="staff \u00b7 evaluation_ops_score_batches"
      endpoint="/api/staff/evaluation/score-batches"
      columns={[{"key": "score_batch_code", "label": "Score Batch Code"}, {"key": "score_formula_version", "label": "Score Formula Version"}, {"key": "score_summary", "label": "Score Summary"}, {"key": "score_batch_status", "label": "Status"}]}
      statusKey="score_batch_status"
      moduleId="evaluation_ops_score_batches"
      createFields={[{ key: "score_formula_version", label: "Score Formula Version" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "score_batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "scoring", "label": "Scoring"}, {"value": "scored", "label": "Scored"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved_for_results", "label": "Approved For Results"}, {"value": "rejected", "label": "Rejected"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
