import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Adjustments"
      eyebrow="staff \u00b7 finance_ops_adjustments"
      endpoint="/api/staff/finance/adjustments"
      columns={[{"key": "adjustment_code", "label": "Adjustment Code"}, {"key": "adjustment_type", "label": "Adjustment Type"}, {"key": "amount", "label": "Amount"}, {"key": "reason", "label": "Reason"}, {"key": "adjustment_status", "label": "Status"}]}
      statusKey="adjustment_status"
      moduleId="finance_ops_adjustments"
      createFields={[{ key: "adjustment_type", label: "Adjustment Type" }, { key: "amount", label: "Amount", type: "number" }, { key: "reason", label: "Reason" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "adjustment_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
