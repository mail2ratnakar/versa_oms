import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reconciliation Runs"
      eyebrow="staff \u00b7 audit_reconciliations"
      endpoint="/api/staff/security-audit/reconciliations"
      columns={[{"key": "recon_code", "label": "Recon Code"}, {"key": "recon_type", "label": "Recon Type"}, {"key": "scope", "label": "Scope"}, {"key": "run_started_at", "label": "Run Started At"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_reconciliations"
      createFields={[{ key: "recon_type", label: "Recon Type" }, { key: "scope", label: "Scope" }, { key: "run_started_at", label: "Run Started At" }, { key: "recon_report", label: "Recon Report" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "running", "label": "Running"}, {"value": "passed", "label": "Passed"}, {"value": "exceptions_found", "label": "Exceptions Found"}, {"value": "failed", "label": "Failed"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
