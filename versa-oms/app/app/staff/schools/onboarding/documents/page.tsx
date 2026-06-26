import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Onboarding Documents"
      eyebrow="staff \u00b7 school_onboarding_documents"
      endpoint="/api/staff/schools/onboarding/documents"
      columns={[{"key": "document_type", "label": "Document Type"}, {"key": "review_note", "label": "Review Note"}, {"key": "reviewed_at", "label": "Reviewed At"}, {"key": "review_status", "label": "Status"}]}
      description="Manage and review onboarding documents across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Schools", "href": "/staff/schools"}, {"label": "Onboarding", "href": "/staff/schools/onboarding"}, {"label": "Documents"}]}
      nextAction="\u2192 Use \u201cNew Onboarding Document\u201d to add one, then act on it from the list."
      statusKey="review_status"
      moduleId="school_onboarding_documents"
      createFields={[{"key": "onboarding_case_id", "label": "Onboarding Case", "type": "reference", "refTable": "school_onboarding_cases"}, {"key": "document_type", "label": "Document Type", "type": "select", "options": [{"value": "authorization_letter", "label": "Authorization Letter"}, {"value": "school_id_proof", "label": "School ID Proof"}, {"value": "coordinator_id_proof_optional", "label": "Coordinator ID Proof Optional"}, {"value": "other", "label": "Other"}]}, {"key": "review_note", "label": "Review Note", "type": "text"}, {"key": "reviewed_at", "label": "Reviewed At", "type": "date"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "accept", "label": "Accept", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "review_status", "options": [{"value": "uploaded", "label": "Uploaded"}, {"value": "under_review", "label": "Under Review"}, {"value": "accepted", "label": "Accepted"}, {"value": "rejected", "label": "Rejected"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
