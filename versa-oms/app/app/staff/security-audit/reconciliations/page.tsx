import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Reconciliation Runs"
      eyebrow="staff \u00b7 audit_reconciliations"
      endpoint="/api/staff/security-audit/reconciliations"
      columns={[{"key": "recon_code", "label": "recon code"}, {"key": "recon_type", "label": "recon type"}, {"key": "scope", "label": "scope"}, {"key": "run_started_at", "label": "run started at"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_reconciliations"
      createFields={[{ key: "recon_type", label: "Recon type" }, { key: "scope", label: "Scope" }, { key: "run_started_at", label: "Run started at" }, { key: "recon_report", label: "Recon report" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
