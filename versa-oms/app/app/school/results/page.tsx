import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results"
      eyebrow="school \u00b7 school_results"
      endpoint="/api/school/results"
      columns={[{"key": "candidate_id", "label": "Candidate"}, {"key": "grade_code", "label": "Grade"}, {"key": "subject_code", "label": "Subject"}, {"key": "max_score", "label": "Max Score"}, {"key": "result_status", "label": "Status"}]}
      description="Manage and review results across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Results"}]}
      statusKey="result_status"
      moduleId="school_results"
    />
  );
}
