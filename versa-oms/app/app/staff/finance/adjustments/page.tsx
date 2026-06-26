import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Adjustments"
      eyebrow="staff \u00b7 finance_ops_adjustments"
      endpoint="/api/staff/finance/adjustments"
      columns={[{"key": "adjustment_code", "label": "Adjustment"}, {"key": "adjustment_type", "label": "Adjustment Type"}, {"key": "amount", "label": "Amount"}, {"key": "reason", "label": "Reason"}, {"key": "adjustment_status", "label": "Status"}]}
      description="Manage and review adjustments across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Finance", "href": "/staff/finance"}, {"label": "Adjustments"}]}
      nextAction="\u2192 Use \u201cNew Adjustment\u201d to add one, then act on it from the list."
      statusKey="adjustment_status"
      moduleId="finance_ops_adjustments"
      createFields={[{"key": "invoice_id", "label": "Invoice", "type": "reference", "refTable": "finance_invoices"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "adjustment_type", "label": "Adjustment Type", "type": "select", "options": [{"value": "discount", "label": "Discount"}, {"value": "waiver", "label": "Waiver"}, {"value": "credit_note", "label": "Credit Note"}, {"value": "refund", "label": "Refund"}, {"value": "reversal", "label": "Reversal"}, {"value": "tax_adjustment", "label": "Tax Adjustment"}, {"value": "commission_adjustment", "label": "Commission Adjustment"}]}, {"key": "amount", "label": "Amount", "type": "number"}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "impact_check", "label": "Impact Check", "type": "text"}, {"key": "applied_at", "label": "Applied At", "type": "date"}]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "apply", "label": "Apply", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "adjustment_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "applied", "label": "Applied"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
