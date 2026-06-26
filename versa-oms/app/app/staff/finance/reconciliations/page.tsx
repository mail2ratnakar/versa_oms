import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reconciliations"
      eyebrow="staff \u00b7 finance_ops_reconciliations"
      endpoint="/api/staff/finance/reconciliations"
      columns={[{"key": "reconciliation_code", "label": "Reconciliation"}, {"key": "provider", "label": "Provider"}, {"key": "total_records", "label": "Total Records"}, {"key": "matched_records", "label": "Matched Records"}, {"key": "reconciliation_status", "label": "Status"}]}
      statusKey="reconciliation_status"
      moduleId="finance_ops_reconciliations"
      createFields={[{"key": "provider", "label": "Provider", "type": "select", "options": [{"value": "mock", "label": "Mock"}, {"value": "razorpay", "label": "Razorpay"}, {"value": "bank_transfer", "label": "Bank Transfer"}, {"value": "manual", "label": "Manual"}, {"value": "other", "label": "Other"}]}, {"key": "total_records", "label": "Total Records", "type": "number"}, {"key": "matched_records", "label": "Matched Records", "type": "number"}, {"key": "mismatch_records", "label": "Mismatch Records", "type": "number"}, {"key": "exception_report", "label": "Exception Report", "type": "text"}, {"key": "closure_note", "label": "Closure Note", "type": "text"}]}
      actions={[{"action": "issue", "label": "Issue", "variant": "blue"}, {"action": "mark_partially_paid", "label": "Mark partially paid", "variant": "light"}, {"action": "mark_paid", "label": "Mark paid", "variant": "blue"}, {"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "void", "label": "Void", "variant": "light", "reason": true, "danger": true}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "reconciliation_status", "options": [{"value": "not_started", "label": "Not Started"}, {"value": "matched", "label": "Matched"}, {"value": "partially_matched", "label": "Partially Matched"}, {"value": "mismatch", "label": "Mismatch"}, {"value": "exception", "label": "Exception"}, {"value": "closed", "label": "Closed"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
