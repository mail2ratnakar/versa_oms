import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificate Requests"
      eyebrow="staff \u00b7 certificate_ops_requests"
      endpoint="/api/staff/certificates/requests"
      columns={[{"key": "request_code", "label": "Request Code"}, {"key": "request_type", "label": "Request Type"}, {"key": "reason", "label": "Reason"}, {"key": "impact_summary", "label": "Impact Summary"}, {"key": "request_status", "label": "Status"}]}
      statusKey="request_status"
      moduleId="certificate_ops_requests"
      createFields={[{ key: "request_type", label: "Request Type" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
