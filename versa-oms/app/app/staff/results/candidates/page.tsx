import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Candidate Results"
      eyebrow="staff \u00b7 results_ops_candidates"
      endpoint="/api/staff/results/candidates"
      columns={[{"key": "candidate_id", "label": "Candidate ID"}, {"key": "grade_code", "label": "Grade Code"}, {"key": "subject_code", "label": "Subject Code"}, {"key": "raw_score", "label": "Raw Score"}, {"key": "result_status", "label": "Status"}]}
      statusKey="result_status"
      moduleId="results_ops_candidates"
      createFields={[{ key: "candidate_id", label: "Candidate ID" }, { key: "raw_score", label: "Raw Score", type: "number" }, { key: "max_score", label: "Max Score", type: "number" }, { key: "percentage_score", label: "Percentage Score", type: "number" }, { key: "result_version", label: "Result Version" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light"}]}
      toolbar={{"facet": {"key": "result_status", "options": [{"value": "generated", "label": "Generated"}, {"value": "ranked", "label": "Ranked"}, {"value": "approved", "label": "Approved"}, {"value": "published", "label": "Published"}, {"value": "withheld", "label": "Withheld"}, {"value": "corrected", "label": "Corrected"}, {"value": "superseded", "label": "Superseded"}, {"value": "voided", "label": "Voided"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
