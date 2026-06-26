import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Candidate Results"
      eyebrow="staff \u00b7 results_ops_candidates"
      endpoint="/api/staff/results/candidates"
      columns={[{"key": "candidate_id", "label": "Candidate"}, {"key": "grade_code", "label": "Grade"}, {"key": "subject_code", "label": "Subject"}, {"key": "max_score", "label": "Max Score"}, {"key": "result_status", "label": "Status"}]}
      description="Manage and review candidate results across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Results", "href": "/staff/results"}, {"label": "Candidates"}]}
      nextAction="\u2192 Use \u201cNew Candidate Result\u201d to add one, then act on it from the list."
      statusKey="result_status"
      moduleId="results_ops_candidates"
      createFields={[{"key": "result_batch_id", "label": "Result Batch", "type": "reference", "refTable": "result_batches"}, {"key": "candidate_id", "label": "Candidate", "type": "text"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "subject_code", "label": "Subject", "type": "text"}, {"key": "max_score", "label": "Max Score", "type": "number"}, {"key": "percentage_score", "label": "Percentage Score", "type": "number"}, {"key": "national_rank", "label": "National Rank", "type": "number"}, {"key": "state_rank", "label": "State Rank", "type": "number"}, {"key": "school_rank", "label": "School Rank", "type": "number"}, {"key": "grade_rank", "label": "Grade Rank", "type": "number"}, {"key": "subject_rank", "label": "Subject Rank", "type": "number"}, {"key": "withhold_reason", "label": "Withhold Reason", "type": "text"}, {"key": "verification_code", "label": "Verification", "type": "text"}, {"key": "result_version", "label": "Result Version", "type": "text"}]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "void", "label": "Void", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "result_status", "options": [{"value": "generated", "label": "Generated"}, {"value": "ranked", "label": "Ranked"}, {"value": "approved", "label": "Approved"}, {"value": "published", "label": "Published"}, {"value": "withheld", "label": "Withheld"}, {"value": "corrected", "label": "Corrected"}, {"value": "superseded", "label": "Superseded"}, {"value": "voided", "label": "Voided"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
