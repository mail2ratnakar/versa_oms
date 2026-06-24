import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier & Logistics"
      eyebrow="staff \u00b7 courier_ops"
      endpoint="/api/staff/courier"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "vendor_status", "label": "Status"}]}
      statusKey="vendor_status"
      moduleId="courier_ops"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light"}]}
    />
  );
}
