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
      actions={[{"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
