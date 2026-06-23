import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Courier Exceptions"
      eyebrow="staff \u00b7 courier_ops_exceptions"
      endpoint="/api/staff/courier/exceptions"
      columns={[{"key": "code", "label": "code"}, {"key": "awb_number", "label": "awb number"}, {"key": "proof_file", "label": "proof file"}, {"key": "reason", "label": "reason"}, {"key": "exception_status", "label": "Status"}]}
      statusKey="exception_status"
      moduleId="courier_ops_exceptions"
      createFields={[{ key: "code", label: "Code" }]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
