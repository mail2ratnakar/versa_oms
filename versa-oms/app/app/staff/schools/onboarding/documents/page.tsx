import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Onboarding Documents"
      eyebrow="staff \u00b7 school_onboarding_documents"
      endpoint="/api/staff/schools/onboarding/documents"
      columns={[{"key": "document_type", "label": "document type"}, {"key": "document_file", "label": "document file"}, {"key": "review_note", "label": "review note"}, {"key": "reviewed_at", "label": "reviewed at"}, {"key": "review_status", "label": "Status"}]}
      statusKey="review_status"
      moduleId="school_onboarding_documents"
      createFields={[{ key: "document_type", label: "Document type" }, { key: "document_file", label: "Document file" }]}
      actions={[{"action": "reject", "label": "Reject", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light"}]}
    />
  );
}
