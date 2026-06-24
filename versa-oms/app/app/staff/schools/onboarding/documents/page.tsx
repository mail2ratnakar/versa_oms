import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Onboarding Documents"
      eyebrow="staff \u00b7 school_onboarding_documents"
      endpoint="/api/staff/schools/onboarding/documents"
      columns={[{"key": "document_type", "label": "Document Type"}, {"key": "document_file", "label": "Document File"}, {"key": "review_note", "label": "Review Note"}, {"key": "reviewed_at", "label": "Reviewed At"}, {"key": "review_status", "label": "Status"}]}
      statusKey="review_status"
      moduleId="school_onboarding_documents"
      createFields={[{ key: "document_type", label: "Document Type" }, { key: "document_file", label: "Document File" }]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "accept", "label": "Accept", "variant": "blue"}, {"action": "reject", "label": "Reject", "variant": "light", "reason": true, "danger": true}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "review_status", "options": [{"value": "uploaded", "label": "Uploaded"}, {"value": "under_review", "label": "Under Review"}, {"value": "accepted", "label": "Accepted"}, {"value": "rejected", "label": "Rejected"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
