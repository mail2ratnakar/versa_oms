import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Evaluation Exceptions"
      eyebrow="staff \u00b7 evaluation_ops_exceptions"
      endpoint="/api/staff/evaluation/exceptions"
      columns={[{"key": "exception_code", "label": "Exception Code"}, {"key": "candidate_id", "label": "Candidate ID"}, {"key": "exception_type", "label": "Exception Type"}, {"key": "severity", "label": "Severity"}, {"key": "exception_status", "label": "Status"}]}
      statusKey="exception_status"
      moduleId="evaluation_ops_exceptions"
      createFields={[{ key: "exception_type", label: "Exception Type" }, { key: "severity", label: "Severity" }, { key: "description", label: "Description" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
