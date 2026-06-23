import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Results"
      eyebrow="staff \u00b7 results_ops"
      endpoint="/api/staff/results"
      columns={[{"key": "result_batch_code", "label": "result batch code"}, {"key": "handoff_snapshot_hash", "label": "handoff snapshot hash"}, {"key": "result_version", "label": "result version"}, {"key": "ranking_policy_version", "label": "ranking policy version"}, {"key": "result_batch_status", "label": "Status"}]}
      statusKey="result_batch_status"
      createFields={[{ key: "handoff_snapshot_hash", label: "Handoff snapshot hash" }, { key: "result_version", label: "Result version" }, { key: "ranking_policy_version", label: "Ranking policy version" }]}
      actions={[{"action": "generate", "label": "Generate", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "schedule", "label": "Schedule", "variant": "light"}, {"action": "publish", "label": "Publish", "variant": "blue"}, {"action": "withhold", "label": "Withhold", "variant": "light"}]}
    />
  );
}
