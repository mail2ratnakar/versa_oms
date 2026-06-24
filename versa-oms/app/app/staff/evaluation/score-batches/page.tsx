import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Score Batches"
      eyebrow="staff \u00b7 evaluation_ops_score_batches"
      endpoint="/api/staff/evaluation/score-batches"
      columns={[{"key": "score_batch_code", "label": "Score Batch Code"}, {"key": "score_formula_version", "label": "Score Formula Version"}, {"key": "scoring_snapshot_hash", "label": "Scoring Snapshot Hash"}, {"key": "score_summary", "label": "Score Summary"}, {"key": "score_batch_status", "label": "Status"}]}
      statusKey="score_batch_status"
      moduleId="evaluation_ops_score_batches"
      createFields={[{ key: "score_formula_version", label: "Score Formula Version" }, { key: "scoring_snapshot_hash", label: "Scoring Snapshot Hash" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
