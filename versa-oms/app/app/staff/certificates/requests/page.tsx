import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificate Requests"
      eyebrow="staff \u00b7 certificate_ops_requests"
      endpoint="/api/staff/certificates/requests"
      columns={[{"key": "request_code", "label": "request code"}, {"key": "request_type", "label": "request type"}, {"key": "reason", "label": "reason"}, {"key": "impact_summary", "label": "impact summary"}, {"key": "request_status", "label": "Status"}]}
      statusKey="request_status"
      moduleId="certificate_ops_requests"
      createFields={[{ key: "request_type", label: "Request type" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
