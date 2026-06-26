import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results"
      eyebrow="staff \u00b7 results_ops"
      endpoint="/api/staff/results"
      columns={[{"key": "result_batch_code", "label": "Result Batch"}, {"key": "result_version", "label": "Result Version"}, {"key": "ranking_policy_version", "label": "Ranking Policy Version"}, {"key": "published_at", "label": "Published At"}, {"key": "result_batch_status", "label": "Status"}]}
      description="Generate, rank and publish results from scored evaluation batches."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Results"}]}
      nextAction="\u2192 Use \u201cNew Result\u201d to add one, then act on it from the list."
      statusKey="result_batch_status"
      moduleId="results_ops"
      createFields={[{"key": "exam_cycle_id", "label": "Exam Cycle", "type": "reference", "refTable": "exam_cycles"}, {"key": "evaluation_score_batch_id", "label": "Evaluation Score Batch", "type": "reference", "refTable": "evaluation_score_batches"}, {"key": "result_version", "label": "Result Version", "type": "text"}, {"key": "ranking_policy_version", "label": "Ranking Policy Version", "type": "text"}, {"key": "published_at", "label": "Published At", "type": "date"}]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "candidate-results", "label": "Candidate Results", "subPath": "candidate-results", "listColumns": ["result_status", "grade_code", "subject_code", "raw_score"]}, {"key": "publication-windows", "label": "Publication Windows", "subPath": "publication-windows", "listColumns": ["publication_status", "publication_code", "target_visibility", "publish_at"]}, {"key": "rank-snapshots", "label": "Rank Snapshots", "subPath": "rank-snapshots", "listColumns": ["snapshot_status", "snapshot_code", "ranking_dimension", "ranking_policy_version"]}]}
      toolbar={{"facet": {"key": "result_batch_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "generated", "label": "Generated"}, {"value": "ranking", "label": "Ranking"}, {"value": "ranked", "label": "Ranked"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "scheduled", "label": "Scheduled"}, {"value": "published", "label": "Published"}, {"value": "partially_published", "label": "Partially Published"}, {"value": "withheld", "label": "Withheld"}, {"value": "correction_pending", "label": "Correction Pending"}, {"value": "corrected", "label": "Corrected"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
