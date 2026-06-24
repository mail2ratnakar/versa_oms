import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier Exceptions"
      eyebrow="staff \u00b7 courier_ops_exceptions"
      endpoint="/api/staff/courier/exceptions"
      columns={[{"key": "code", "label": "Code"}, {"key": "awb_number", "label": "Awb Number"}, {"key": "proof_file", "label": "Proof File"}, {"key": "reason", "label": "Reason"}, {"key": "exception_status", "label": "Status"}]}
      statusKey="exception_status"
      moduleId="courier_ops_exceptions"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
