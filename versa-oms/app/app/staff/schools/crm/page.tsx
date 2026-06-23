import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="School CRM"
      eyebrow="staff \u00b7 school_crm"
      endpoint="/api/staff/schools/crm"
      columns={[{"key": "lead_code", "label": "lead code"}, {"key": "school_name", "label": "school name"}, {"key": "normalized_school_name", "label": "normalized school name"}, {"key": "board", "label": "board"}, {"key": "lead_status", "label": "Status"}]}
      statusKey="lead_status"
      createFields={[{ key: "school_name", label: "School name" }, { key: "normalized_school_name", label: "Normalized school name" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "lead_source", label: "Lead source" }]}
      actions={[{"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
