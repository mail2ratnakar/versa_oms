import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Access Reviews"
      eyebrow="staff \u00b7 security_audit_access_reviews"
      endpoint="/api/staff/security-audit/access-reviews"
      columns={[{"key": "review_code", "label": "Review Code"}, {"key": "scope", "label": "Scope"}, {"key": "module_id", "label": "Module ID"}, {"key": "review_snapshot", "label": "Review Snapshot"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="security_audit_access_reviews"
      createFields={[{ key: "scope", label: "Scope" }, { key: "review_snapshot", label: "Review Snapshot" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
