import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Status Controls"
      eyebrow="staff \u00b7 school_onboarding_status_controls"
      endpoint="/api/staff/schools/onboarding/status-controls"
      columns={[{"key": "control_type", "label": "control type"}, {"key": "reason", "label": "reason"}, {"key": "applied_at", "label": "applied at"}, {"key": "released_at", "label": "released at"}, {"key": "control_status", "label": "Status"}]}
      statusKey="control_status"
      moduleId="school_onboarding_status_controls"
      createFields={[{ key: "control_type", label: "Control type" }, { key: "reason", label: "Reason" }, { key: "applied_at", label: "Applied at" }]}
      actions={[{"action": "release", "label": "Release", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
