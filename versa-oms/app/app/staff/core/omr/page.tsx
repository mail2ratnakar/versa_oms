import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="OMR imports"
      eyebrow="staff \u00b7 core_omr"
      endpoint="/api/staff/core/omr"
      columns={[{"key": "import_code", "label": "Import"}, {"key": "review_status", "label": "Review Status"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="omr_imports"
      createFields={[{"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "courier_batch_id", "label": "Courier Batch", "type": "reference", "refTable": "courier_batches"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve_for_results", "label": "Approve for results", "variant": "blue"}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
