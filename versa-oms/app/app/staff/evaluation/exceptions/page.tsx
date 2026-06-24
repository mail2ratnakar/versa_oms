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
      toolbar={{"facet": {"key": "exception_status", "options": [{"value": "open", "label": "Open"}, {"value": "under_review", "label": "Under Review"}, {"value": "resolved", "label": "Resolved"}, {"value": "accepted_with_risk", "label": "Accepted With Risk"}, {"value": "escalated", "label": "Escalated"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
