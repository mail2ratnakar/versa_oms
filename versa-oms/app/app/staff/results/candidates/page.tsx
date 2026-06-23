import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Candidate Results"
      eyebrow="staff \u00b7 results_ops_candidates"
      endpoint="/api/staff/results/candidates"
      columns={[{"key": "candidate_id", "label": "candidate id"}, {"key": "grade_code", "label": "grade code"}, {"key": "subject_code", "label": "subject code"}, {"key": "raw_score", "label": "raw score"}, {"key": "result_status", "label": "Status"}]}
      statusKey="result_status"
      moduleId="results_ops_candidates"
      createFields={[{ key: "candidate_id", label: "Candidate id" }, { key: "raw_score", label: "Raw score", type: "number" }, { key: "max_score", label: "Max score", type: "number" }, { key: "percentage_score", label: "Percentage score", type: "number" }, { key: "result_version", label: "Result version" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light"}]}
    />
  );
}
