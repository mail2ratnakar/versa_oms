import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Evaluation Exceptions"
      eyebrow="staff \u00b7 evaluation_ops_exceptions"
      endpoint="/api/staff/evaluation/exceptions"
      columns={[{"key": "exception_code", "label": "exception code"}, {"key": "candidate_id", "label": "candidate id"}, {"key": "exception_type", "label": "exception type"}, {"key": "severity", "label": "severity"}, {"key": "exception_status", "label": "Status"}]}
      statusKey="exception_status"
      moduleId="evaluation_ops_exceptions"
      createFields={[{ key: "exception_type", label: "Exception type" }, { key: "severity", label: "Severity" }, { key: "description", label: "Description" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
