import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Access Reviews"
      eyebrow="staff \u00b7 security_audit_access_reviews"
      endpoint="/api/staff/security-audit/access-reviews"
      columns={[{"key": "review_code", "label": "review code"}, {"key": "scope", "label": "scope"}, {"key": "module_id", "label": "module id"}, {"key": "review_snapshot", "label": "review snapshot"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="security_audit_access_reviews"
      createFields={[{ key: "scope", label: "Scope" }, { key: "review_snapshot", label: "Review snapshot" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
