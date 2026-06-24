import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Audit Cases"
      eyebrow="staff \u00b7 audit_cases"
      endpoint="/api/staff/security-audit/cases"
      columns={[{"key": "case_code", "label": "Case Code"}, {"key": "case_type", "label": "Case Type"}, {"key": "title", "label": "Title"}, {"key": "description", "label": "Description"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="audit_cases"
      createFields={[{ key: "case_type", label: "Case Type" }, { key: "title", label: "Title" }, { key: "related_event_ids", label: "Related Event Ids" }, { key: "source_modules", label: "Source Modules" }, { key: "risk_level", label: "Risk Level" }, { key: "opened_at", label: "Opened At" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
