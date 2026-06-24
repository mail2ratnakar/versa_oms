import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results (core)"
      eyebrow="staff \u00b7 core_results"
      endpoint="/api/staff/core/results"
      columns={[{"key": "result_code", "label": "Result Code"}, {"key": "raw_score", "label": "Raw Score"}, {"key": "max_marks", "label": "Max Marks"}, {"key": "percentage", "label": "Percentage"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results"
      createFields={[{ key: "raw_score", label: "Raw Score", type: "number" }, { key: "max_marks", label: "Max Marks", type: "number" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "revoke", "label": "Revoke", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
