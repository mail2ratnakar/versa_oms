import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results (core)"
      eyebrow="staff \u00b7 core_results"
      endpoint="/api/staff/core/results"
      columns={[{"key": "result_code", "label": "Result"}, {"key": "max_marks", "label": "Max Marks"}, {"key": "percentage", "label": "Percentage"}, {"key": "school_rank", "label": "School Rank"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results"
      createFields={[{"key": "student_id", "label": "Student", "type": "reference", "refTable": "students"}, {"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "max_marks", "label": "Max Marks", "type": "number"}, {"key": "percentage", "label": "Percentage", "type": "number"}, {"key": "school_rank", "label": "School Rank", "type": "number"}, {"key": "city_rank", "label": "City Rank", "type": "number"}, {"key": "state_rank", "label": "State Rank", "type": "number"}, {"key": "national_rank", "label": "National Rank", "type": "number"}, {"key": "award_category", "label": "Award Category", "type": "text"}]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
