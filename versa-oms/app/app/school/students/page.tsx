import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Students"
      eyebrow="school \u00b7 school_students"
      endpoint="/api/school/students"
      columns={[{"key": "candidate_id", "label": "Candidate"}, {"key": "student_name", "label": "Student Name"}, {"key": "grade", "label": "Grade"}, {"key": "section", "label": "Section"}, {"key": "status", "label": "Status"}]}
      description="Manage and review students across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Students"}]}
      nextAction="\u2192 Use \u201cNew Student\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="school_students"
      createFields={[{"key": "student_name", "label": "Student name", "type": "text"}, {"key": "grade", "label": "Grade", "type": "text"}, {"key": "consent_obtained", "label": "Consent obtained", "type": "checkbox"}]}
    />
  );
}
