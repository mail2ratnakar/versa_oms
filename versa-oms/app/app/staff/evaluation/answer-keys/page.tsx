import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Answer Keys"
      eyebrow="staff \u00b7 evaluation_ops_answer_keys"
      endpoint="/api/staff/evaluation/answer-keys"
      columns={[{"key": "answer_key_code", "label": "Answer Key Code"}, {"key": "subject_code", "label": "Subject Code"}, {"key": "grade_code", "label": "Grade Code"}, {"key": "paper_set_code", "label": "Paper Set Code"}, {"key": "key_status", "label": "Status"}]}
      statusKey="key_status"
      moduleId="evaluation_ops_answer_keys"
      createFields={[{ key: "key_version", label: "Key Version" }, { key: "answer_key_payload", label: "Answer Key Payload" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "score-batches", "label": "Score Batches", "subPath": "score-batches", "listColumns": ["score_batch_status", "score_batch_code", "score_formula_version", "candidate_count"]}]}
      toolbar={{"facet": {"key": "key_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "final", "label": "Final"}, {"value": "superseded", "label": "Superseded"}, {"value": "revoked", "label": "Revoked"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
