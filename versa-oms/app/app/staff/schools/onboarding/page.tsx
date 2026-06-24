import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="School Onboarding"
      eyebrow="staff \u00b7 school_onboarding_ops"
      endpoint="/api/staff/schools/onboarding"
      columns={[{"key": "onboarding_code", "label": "Onboarding Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "school_name", "label": "School Name"}, {"key": "normalized_school_name", "label": "Normalized School Name"}, {"key": "onboarding_status", "label": "Status"}]}
      statusKey="onboarding_status"
      moduleId="school_onboarding_ops"
      createFields={[{ key: "source_type", label: "Source Type" }, { key: "school_name", label: "School Name" }, { key: "normalized_school_name", label: "Normalized School Name" }, { key: "address", label: "Address" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "coordinator_name", label: "Coordinator Name" }, { key: "coordinator_email", label: "Coordinator Email" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "activate", "label": "Activate", "variant": "blue"}, {"action": "block", "label": "Block", "variant": "light"}, {"action": "suspend", "label": "Suspend", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
