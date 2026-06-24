import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Staff Users"
      eyebrow="staff \u00b7 staff_users"
      endpoint="/api/staff/admin/users"
      columns={[{"key": "staff_code", "label": "Staff Code"}, {"key": "full_name", "label": "Full Name"}, {"key": "display_name", "label": "Display Name"}, {"key": "email", "label": "Email"}, {"key": "staff_status", "label": "Status"}]}
      statusKey="staff_status"
      moduleId="staff_users"
      createFields={[{ key: "full_name", label: "Full Name" }, { key: "email", label: "Email" }, { key: "department", label: "Department" }, { key: "primary_role", label: "Primary Role" }, { key: "employment_type", label: "Employment Type" }, { key: "joining_date", label: "Joining Date", type: "date" }]}
      actions={[{"action": "suspend", "label": "Suspend", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
