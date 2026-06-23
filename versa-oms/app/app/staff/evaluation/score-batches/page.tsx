import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Score Batches"
      eyebrow="staff \u00b7 evaluation_ops_score_batches"
      endpoint="/api/staff/evaluation/score-batches"
      columns={[{"key": "score_batch_code", "label": "score batch code"}, {"key": "score_formula_version", "label": "score formula version"}, {"key": "scoring_snapshot_hash", "label": "scoring snapshot hash"}, {"key": "score_summary", "label": "score summary"}, {"key": "score_batch_status", "label": "Status"}]}
      statusKey="score_batch_status"
      moduleId="evaluation_ops_score_batches"
      createFields={[{ key: "score_formula_version", label: "Score formula version" }, { key: "scoring_snapshot_hash", label: "Scoring snapshot hash" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
