import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Forensics Cases"
      eyebrow="staff \u00b7 security_audit_forensics"
      endpoint="/api/staff/security-audit/forensics"
      columns={[{"key": "case_code", "label": "case code"}, {"key": "case_title", "label": "case title"}, {"key": "evidence_snapshot_hash", "label": "evidence snapshot hash"}, {"key": "case_summary", "label": "case summary"}, {"key": "case_status", "label": "Status"}]}
      statusKey="case_status"
      moduleId="security_audit_forensics"
      createFields={[{ key: "case_title", label: "Case title" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
