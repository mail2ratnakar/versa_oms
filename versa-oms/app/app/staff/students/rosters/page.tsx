import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Student Rosters"
      eyebrow="staff \u00b7 student_roster_ops"
      endpoint="/api/staff/students/rosters"
      columns={[{"key": "batch_code", "label": "Batch Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "source_file", "label": "Source File"}, {"key": "upload_reason", "label": "Upload Reason"}, {"key": "batch_status", "label": "Status"}]}
      statusKey="batch_status"
      moduleId="student_roster_ops"
      createFields={[{ key: "source_type", label: "Source Type" }]}
      actions={[{"action": "validate", "label": "Validate", "variant": "light"}, {"action": "submit_for_lock", "label": "Submit for lock", "variant": "light"}, {"action": "lock", "label": "Lock", "variant": "blue"}, {"action": "supersede", "label": "Supersede", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "corrections", "label": "Corrections", "subPath": "corrections", "listColumns": ["correction_status", "correction_code", "correction_type", "requested_change"]}, {"key": "candidate-id-events", "label": "Candidate Id Events", "subPath": "candidate-id-events", "listColumns": ["event_code", "reason", "metadata", "created_at"]}, {"key": "events", "label": "Events", "subPath": "events", "listColumns": ["event_code", "previous_status", "new_status", "reason"]}]}
      toolbar={{"facet": {"key": "batch_status", "options": [{"value": "uploaded", "label": "Uploaded"}, {"value": "validating", "label": "Validating"}, {"value": "validation_failed", "label": "Validation Failed"}, {"value": "validated", "label": "Validated"}, {"value": "submitted_for_lock", "label": "Submitted For Lock"}, {"value": "locked", "label": "Locked"}, {"value": "unlock_requested", "label": "Unlock Requested"}, {"value": "correction_pending", "label": "Correction Pending"}, {"value": "superseded", "label": "Superseded"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
