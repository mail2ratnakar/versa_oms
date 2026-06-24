import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results"
      eyebrow="school \u00b7 school_results"
      endpoint="/api/school/results"
      columns={[{"key": "candidate_id", "label": "Candidate ID"}, {"key": "grade_code", "label": "Grade Code"}, {"key": "subject_code", "label": "Subject Code"}, {"key": "raw_score", "label": "Raw Score"}, {"key": "result_status", "label": "Status"}]}
      statusKey="result_status"
      moduleId="school_results"
    />
  );
}
