import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Students"
      eyebrow="staff \u00b7 core_students"
      endpoint="/api/staff/core/students"
      columns={[{"key": "candidate_id", "label": "Candidate"}, {"key": "student_name", "label": "Student Name"}, {"key": "grade", "label": "Grade"}, {"key": "section", "label": "Section"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="students"
      createFields={[{"key": "candidate_id", "label": "Candidate", "type": "text"}, {"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "student_name", "label": "Student Name", "type": "text"}, {"key": "grade", "label": "Grade", "type": "text"}, {"key": "section", "label": "Section", "type": "text"}, {"key": "school_roll_number", "label": "School Roll Number", "type": "text"}, {"key": "parent_guardian_name", "label": "Parent Guardian Name", "type": "text"}, {"key": "parent_contact", "label": "Parent Contact", "type": "text"}, {"key": "consent_obtained", "label": "Consent Obtained", "type": "checkbox"}, {"key": "consent_date", "label": "Consent Date", "type": "date"}, {"key": "validation_errors", "label": "Validation Errors", "type": "text"}]}
    />
  );
}
