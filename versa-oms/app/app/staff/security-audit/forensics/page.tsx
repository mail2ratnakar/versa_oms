import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Forensics Cases"
      eyebrow="staff \u00b7 security_audit_forensics"
      endpoint="/api/staff/security-audit/forensics"
      columns={[{"key": "case_code", "label": "Case Code"}, {"key": "case_title", "label": "Case Title"}, {"key": "evidence_snapshot_hash", "label": "Evidence Snapshot Hash"}, {"key": "case_summary", "label": "Case Summary"}, {"key": "case_status", "label": "Status"}]}
      statusKey="case_status"
      moduleId="security_audit_forensics"
      createFields={[{ key: "case_title", label: "Case Title" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
