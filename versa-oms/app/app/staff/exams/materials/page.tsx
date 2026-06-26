import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Exam Materials"
      eyebrow="staff \u00b7 exam_material_ops"
      endpoint="/api/staff/exams/materials"
      columns={[{"key": "template_code", "label": "Template"}, {"key": "template_name", "label": "Template Name"}, {"key": "template_type", "label": "Template Type"}, {"key": "template_version", "label": "Template Version"}, {"key": "template_status", "label": "Status"}]}
      statusKey="template_status"
      moduleId="exam_material_ops"
      createFields={[{"key": "template_name", "label": "Template Name", "type": "text"}, {"key": "template_type", "label": "Template Type", "type": "select", "options": [{"value": "question_paper", "label": "Question Paper"}, {"value": "answer_sheet", "label": "Answer Sheet"}, {"value": "cover_sheet", "label": "Cover Sheet"}, {"value": "dispatch_manifest", "label": "Dispatch Manifest"}, {"value": "bundle", "label": "Bundle"}]}, {"key": "template_version", "label": "Template Version", "type": "text"}, {"key": "template_schema", "label": "Template Schema", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "retire", "label": "Retire", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "template_status", "options": [{"value": "draft", "label": "Draft"}, {"value": "under_review", "label": "Under Review"}, {"value": "approved", "label": "Approved"}, {"value": "active", "label": "Active"}, {"value": "retired", "label": "Retired"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
