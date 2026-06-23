import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Cases"
      eyebrow="staff \u00b7 audit_cases"
      endpoint="/api/staff/security-audit/cases"
      columns={[{"key": "case_code", "label": "case code"}, {"key": "case_type", "label": "case type"}, {"key": "title", "label": "title"}, {"key": "description", "label": "description"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_cases"
      createFields={[{ key: "case_type", label: "Case type" }, { key: "title", label: "Title" }, { key: "related_event_ids", label: "Related event ids" }, { key: "source_modules", label: "Source modules" }, { key: "risk_level", label: "Risk level" }, { key: "opened_at", label: "Opened at" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
