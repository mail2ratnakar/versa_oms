import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Status Controls"
      eyebrow="staff \u00b7 school_onboarding_status_controls"
      endpoint="/api/staff/schools/onboarding/status-controls"
      columns={[{"key": "control_type", "label": "Control Type"}, {"key": "reason", "label": "Reason"}, {"key": "applied_at", "label": "Applied At"}, {"key": "released_at", "label": "Released At"}, {"key": "control_status", "label": "Status"}]}
      statusKey="control_status"
      moduleId="school_onboarding_status_controls"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "onboarding_case_id", "label": "Onboarding Case", "type": "reference", "refTable": "school_onboarding_cases"}, {"key": "control_type", "label": "Control Type", "type": "select", "options": [{"value": "none", "label": "None"}, {"value": "blocked", "label": "Blocked"}, {"value": "suspended", "label": "Suspended"}, {"value": "security_hold", "label": "Security Hold"}]}, {"key": "reason", "label": "Reason", "type": "text"}, {"key": "applied_at", "label": "Applied At", "type": "date"}, {"key": "released_at", "label": "Released At", "type": "date"}]}
      actions={[{"action": "release", "label": "Release", "variant": "blue"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "control_status", "options": [{"value": "active", "label": "Active"}, {"value": "released", "label": "Released"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
