import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="School Onboarding"
      eyebrow="staff \u00b7 school_onboarding_ops"
      endpoint="/api/staff/schools/onboarding"
      columns={[{"key": "onboarding_code", "label": "onboarding code"}, {"key": "source_type", "label": "source type"}, {"key": "school_name", "label": "school name"}, {"key": "normalized_school_name", "label": "normalized school name"}, {"key": "onboarding_status", "label": "Status"}]}
      statusKey="onboarding_status"
      createFields={[{ key: "source_type", label: "Source type" }, { key: "school_name", label: "School name" }, { key: "normalized_school_name", label: "Normalized school name" }, { key: "address", label: "Address" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "coordinator_name", label: "Coordinator name" }, { key: "coordinator_email", label: "Coordinator email" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "approve", "label": "Approve", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light"}, {"action": "block", "label": "Block", "variant": "light"}, {"action": "suspend", "label": "Suspend", "variant": "light"}]}
    />
  );
}
