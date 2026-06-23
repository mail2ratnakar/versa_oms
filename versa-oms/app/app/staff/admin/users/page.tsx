import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Staff Users"
      eyebrow="staff \u00b7 staff_users"
      endpoint="/api/staff/admin/users"
      columns={[{"key": "staff_code", "label": "staff code"}, {"key": "full_name", "label": "full name"}, {"key": "display_name", "label": "display name"}, {"key": "email", "label": "email"}, {"key": "staff_status", "label": "Status"}]}
      statusKey="staff_status"
      createFields={[{ key: "full_name", label: "Full name" }, { key: "email", label: "Email" }, { key: "department", label: "Department" }, { key: "primary_role", label: "Primary role" }, { key: "employment_type", label: "Employment type" }, { key: "joining_date", label: "Joining date", type: "date" }]}
      actions={[{"action": "suspend", "label": "Suspend", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
