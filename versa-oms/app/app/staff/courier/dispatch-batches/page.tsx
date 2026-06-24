import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Dispatch Batches"
      eyebrow="staff \u00b7 courier_ops_dispatch"
      endpoint="/api/staff/courier/dispatch-batches"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="courier_ops_dispatch"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light"}]}
    />
  );
}
