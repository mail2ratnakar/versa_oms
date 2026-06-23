import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results"
      eyebrow="school \u00b7 school_results"
      endpoint="/api/school/results"
      columns={[{"key": "candidate_id", "label": "candidate id"}, {"key": "grade_code", "label": "grade code"}, {"key": "subject_code", "label": "subject code"}, {"key": "raw_score", "label": "raw score"}, {"key": "result_status", "label": "Status"}]}
      statusKey="result_status"
      moduleId="school_results"
    />
  );
}
