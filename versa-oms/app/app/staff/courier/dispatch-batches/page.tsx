import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Dispatch Batches"
      eyebrow="staff \u00b7 courier_ops_dispatch"
      endpoint="/api/staff/courier/dispatch-batches"
      columns={[{"key": "code", "label": "code"}, {"key": "awb_number", "label": "awb number"}, {"key": "proof_file", "label": "proof file"}, {"key": "reason", "label": "reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="courier_ops_dispatch"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "block", "label": "Block", "variant": "light"}]}
    />
  );
}
