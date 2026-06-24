import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="School Onboarding"
      eyebrow="staff \u00b7 school_onboarding_ops"
      endpoint="/api/staff/schools/onboarding"
      columns={[{"key": "onboarding_code", "label": "Onboarding Code"}, {"key": "source_type", "label": "Source Type"}, {"key": "school_name", "label": "School Name"}, {"key": "board", "label": "Board"}, {"key": "onboarding_status", "label": "Status"}]}
      statusKey="onboarding_status"
      moduleId="school_onboarding_ops"
      createFields={[{ key: "source_type", label: "Source Type" }, { key: "school_name", label: "School Name" }, { key: "address", label: "Address" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "coordinator_name", label: "Coordinator Name" }, { key: "coordinator_email", label: "Coordinator Email" }]}
      actions={[{"action": "submit", "label": "Submit", "variant": "light"}, {"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "activate", "label": "Activate", "variant": "blue"}, {"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}, {"action": "suspend", "label": "Suspend", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      detailPanels={[{"key": "documents", "label": "Documents", "subPath": "documents", "listColumns": ["review_status", "document_type", "review_note", "reviewed_at"], "addFields": [{"key": "document_type", "label": "Document type", "type": "select", "required": true, "options": ["authorization_letter", "school_id_proof", "coordinator_id_proof_optional", "other"]}, {"key": "review_note", "label": "Note", "type": "textarea"}], "editFields": [{"key": "review_status", "label": "Decision", "type": "select", "required": true, "options": ["under_review", "accepted", "rejected"]}, {"key": "review_note", "label": "Review note", "type": "textarea"}]}, {"key": "events", "label": "Events", "subPath": "events", "listColumns": ["event_code", "previous_status", "new_status", "reason"]}, {"key": "status-controls", "label": "Status Controls", "subPath": "status-controls", "listColumns": ["control_status", "control_type", "reason", "applied_at"]}]}
      toolbar={{"facet": {"key": "onboarding_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "submitted", "label": "Submitted"}, {"value": "under_review", "label": "Under Review"}, {"value": "needs_more_info", "label": "Needs More Info"}, {"value": "approved", "label": "Approved"}, {"value": "rejected", "label": "Rejected"}, {"value": "activated", "label": "Activated"}, {"value": "blocked", "label": "Blocked"}, {"value": "suspended", "label": "Suspended"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
