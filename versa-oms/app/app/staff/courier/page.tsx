import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier & Logistics"
      eyebrow="staff \u00b7 courier_ops"
      endpoint="/api/staff/courier"
      columns={[{"key": "code", "label": "code"}, {"key": "awb_number", "label": "awb number"}, {"key": "proof_file", "label": "proof file"}, {"key": "reason", "label": "reason"}, {"key": "vendor_status", "label": "Status"}]}
      statusKey="vendor_status"
      moduleId="courier_ops"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light"}]}
    />
  );
}
