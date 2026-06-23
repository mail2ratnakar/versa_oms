import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results (core)"
      eyebrow="staff \u00b7 core_results"
      endpoint="/api/staff/core/results"
      columns={[{"key": "result_code", "label": "result code"}, {"key": "raw_score", "label": "raw score"}, {"key": "max_marks", "label": "max marks"}, {"key": "percentage", "label": "percentage"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="results"
      createFields={[{ key: "raw_score", label: "Raw score", type: "number" }, { key: "max_marks", label: "Max marks", type: "number" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light"}, {"action": "revoke", "label": "Revoke", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
