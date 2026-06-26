import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Score Batches"
      eyebrow="staff \u00b7 evaluation_ops_score_batches"
      endpoint="/api/staff/evaluation/score-batches"
      columns={[{"key": "score_batch_code", "label": "Score Batch"}, {"key": "score_formula_version", "label": "Score Formula Version"}, {"key": "score_summary", "label": "Score Summary"}, {"key": "score_batch_status", "label": "Status"}]}
      statusKey="score_batch_status"
      moduleId="evaluation_ops_score_batches"
      createFields={[{"key": "import_batch_id", "label": "Import Batch", "type": "reference", "refTable": "evaluation_import_batches"}, {"key": "answer_key_id", "label": "Answer Key", "type": "reference", "refTable": "evaluation_answer_keys"}, {"key": "score_formula_version", "label": "Score Formula Version", "type": "text"}, {"key": "score_summary", "label": "Score Summary", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "candidate-scores", "label": "Candidate Scores", "subPath": "candidate-scores", "listColumns": ["score_status", "raw_score", "correct_count", "wrong_count"]}]}
      toolbar={{"facet": {"key": "score_batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "scoring", "label": "Scoring"}, {"value": "scored", "label": "Scored"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved_for_results", "label": "Approved For Results"}, {"value": "rejected", "label": "Rejected"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
