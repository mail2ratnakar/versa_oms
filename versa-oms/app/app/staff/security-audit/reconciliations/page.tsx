import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reconciliation Runs"
      eyebrow="staff \u00b7 audit_reconciliations"
      endpoint="/api/staff/security-audit/reconciliations"
      columns={[{"key": "recon_code", "label": "Recon"}, {"key": "recon_type", "label": "Recon Type"}, {"key": "scope", "label": "Scope"}, {"key": "run_started_at", "label": "Run Started At"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_reconciliations"
      createFields={[{"key": "recon_type", "label": "Recon Type", "type": "select", "options": [{"value": "student_count_vs_payment", "label": "Student Count Vs Payment"}, {"value": "payment_vs_slot", "label": "Payment Vs Slot"}, {"value": "slot_vs_material", "label": "Slot Vs Material"}, {"value": "material_vs_courier", "label": "Material Vs Courier"}, {"value": "courier_vs_omr", "label": "Courier Vs OMR"}, {"value": "omr_vs_results", "label": "OMR Vs Results"}, {"value": "results_vs_certificates", "label": "Results Vs Certificates"}, {"value": "notification_delivery", "label": "Notification Delivery"}, {"value": "full_chain", "label": "Full Chain"}]}, {"key": "scope", "label": "Scope", "type": "text"}, {"key": "run_started_at", "label": "Run Started At", "type": "date"}, {"key": "run_completed_at", "label": "Run Completed At", "type": "date"}, {"key": "recon_report", "label": "Recon Report", "type": "text"}]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "running", "label": "Running"}, {"value": "passed", "label": "Passed"}, {"value": "exceptions_found", "label": "Exceptions Found"}, {"value": "failed", "label": "Failed"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
