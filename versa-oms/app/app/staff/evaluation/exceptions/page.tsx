import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Evaluation Exceptions"
      eyebrow="staff \u00b7 evaluation_ops_exceptions"
      endpoint="/api/staff/evaluation/exceptions"
      columns={[{"key": "exception_code", "label": "Exception"}, {"key": "candidate_id", "label": "Candidate"}, {"key": "exception_type", "label": "Exception Type"}, {"key": "severity", "label": "Severity"}, {"key": "exception_status", "label": "Status"}]}
      statusKey="exception_status"
      moduleId="evaluation_ops_exceptions"
      createFields={[{"key": "import_batch_id", "label": "Import Batch", "type": "reference", "refTable": "evaluation_import_batches"}, {"key": "candidate_id", "label": "Candidate", "type": "text"}, {"key": "exception_type", "label": "Exception Type", "type": "select", "options": [{"value": "missing_candidate_id", "label": "Missing Candidate"}, {"value": "duplicate_candidate_id", "label": "Duplicate Candidate"}, {"value": "unreadable_scan", "label": "Unreadable Scan"}, {"value": "blank_answer_sheet", "label": "Blank Answer Sheet"}, {"value": "count_mismatch", "label": "Count Mismatch"}, {"value": "answer_key_mismatch", "label": "Answer Key Mismatch"}, {"value": "school_mismatch", "label": "School Mismatch"}, {"value": "slot_mismatch", "label": "Slot Mismatch"}, {"value": "tampering_suspected", "label": "Tampering Suspected"}, {"value": "late_or_missing_batch", "label": "Late Or Missing Batch"}, {"value": "manual_correction_required", "label": "Manual Correction Required"}]}, {"key": "severity", "label": "Severity", "type": "select", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "critical", "label": "Critical"}]}, {"key": "description", "label": "Description", "type": "text"}, {"key": "owner_id", "label": "Owner", "type": "reference", "refTable": "staff_profiles"}, {"key": "resolution_note", "label": "Resolution Note", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "resolve", "label": "Resolve", "variant": "blue"}, {"action": "escalate", "label": "Escalate", "variant": "light"}, {"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "exception_status", "options": [{"value": "open", "label": "Open"}, {"value": "under_review", "label": "Under Review"}, {"value": "resolved", "label": "Resolved"}, {"value": "accepted_with_risk", "label": "Accepted With Risk"}, {"value": "escalated", "label": "Escalated"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
