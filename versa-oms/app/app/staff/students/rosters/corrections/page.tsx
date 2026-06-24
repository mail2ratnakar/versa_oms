import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Roster Corrections"
      eyebrow="staff \u00b7 student_roster_ops_corrections"
      endpoint="/api/staff/students/rosters/corrections"
      columns={[{"key": "correction_code", "label": "Correction Code"}, {"key": "correction_type", "label": "Correction Type"}, {"key": "requested_change", "label": "Requested Change"}, {"key": "reason", "label": "Reason"}, {"key": "correction_status", "label": "Status"}]}
      statusKey="correction_status"
      moduleId="student_roster_ops_corrections"
      createFields={[{ key: "correction_type", label: "Correction Type" }, { key: "requested_change", label: "Requested Change" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "correction_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
