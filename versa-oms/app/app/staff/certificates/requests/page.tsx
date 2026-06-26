import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Certificate Requests"
      eyebrow="staff \u00b7 certificate_ops_requests"
      endpoint="/api/staff/certificates/requests"
      columns={[{"key": "request_code", "label": "Request"}, {"key": "request_type", "label": "Request Type"}, {"key": "reason", "label": "Reason"}, {"key": "impact_summary", "label": "Impact Summary"}, {"key": "request_status", "label": "Status"}]}
      statusKey="request_status"
      moduleId="certificate_ops_requests"
      createFields={[{"key": "certificate_id", "label": "Certificate", "type": "reference", "refTable": "certificates"}, {"key": "request_type", "label": "Request Type", "type": "select", "options": [{"value": "generate", "label": "Generate"}, {"value": "bulk_generate", "label": "Bulk Generate"}, {"value": "publish", "label": "Publish"}, {"value": "reissue", "label": "Reissue"}, {"value": "revoke", "label": "Revoke"}, {"value": "impact_review", "label": "Impact Review"}, {"value": "download_support", "label": "Download Support"}]}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "result_correction_id", "label": "Result Correction", "type": "reference", "refTable": "result_corrections"}, {"key": "impact_summary", "label": "Impact Summary", "type": "text"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "request_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
