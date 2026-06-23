import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Answer Keys"
      eyebrow="staff \u00b7 evaluation_ops_answer_keys"
      endpoint="/api/staff/evaluation/answer-keys"
      columns={[{"key": "answer_key_code", "label": "answer key code"}, {"key": "subject_code", "label": "subject code"}, {"key": "grade_code", "label": "grade code"}, {"key": "paper_set_code", "label": "paper set code"}, {"key": "key_status", "label": "Status"}]}
      statusKey="key_status"
      moduleId="evaluation_ops_answer_keys"
      createFields={[{ key: "key_version", label: "Key version" }, { key: "answer_key_payload", label: "Answer key payload" }]}
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
