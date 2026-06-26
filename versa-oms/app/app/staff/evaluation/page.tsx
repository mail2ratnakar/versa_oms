import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Evaluation"
      eyebrow="staff \u00b7 evaluation_ops"
      endpoint="/api/staff/evaluation"
      columns={[{"key": "answer_key_code", "label": "Answer Key"}, {"key": "subject_code", "label": "Subject"}, {"key": "grade_code", "label": "Grade"}, {"key": "paper_set_code", "label": "Paper Set"}, {"key": "key_status", "label": "Status"}]}
      description="Import OMR/CSV responses and generate score batches from approved answer keys."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Evaluation"}]}
      nextAction="\u2192 Use \u201cNew Evaluation\u201d to add one, then act on it from the list."
      statusKey="key_status"
      moduleId="evaluation_ops"
      createFields={[{"key": "exam_cycle_id", "label": "Exam Cycle", "type": "reference", "refTable": "exam_cycles"}, {"key": "subject_code", "label": "Subject", "type": "text"}, {"key": "grade_code", "label": "Grade", "type": "text"}, {"key": "paper_set_code", "label": "Paper Set", "type": "text"}, {"key": "key_version", "label": "Key Version", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "score-batches", "label": "Score Batches", "subPath": "score-batches", "listColumns": ["score_batch_status", "score_batch_code", "score_formula_version", "candidate_count"]}]}
      toolbar={{"facet": {"key": "key_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "final", "label": "Final"}, {"value": "superseded", "label": "Superseded"}, {"value": "revoked", "label": "Revoked"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
