import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Students"
      eyebrow="school \u00b7 school_students"
      endpoint="/api/school/students"
      columns={[{"key": "candidate_id", "label": "Candidate"}, {"key": "student_name", "label": "Student Name"}, {"key": "grade", "label": "Grade"}, {"key": "section", "label": "Section"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="school_students"
      createFields={[{"key": "student_name", "label": "Student name", "type": "text"}, {"key": "grade", "label": "Grade", "type": "text"}, {"key": "consent_obtained", "label": "Consent obtained", "type": "checkbox"}]}
    />
  );
}
