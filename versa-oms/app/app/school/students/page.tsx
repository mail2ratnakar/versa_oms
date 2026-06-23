import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Students"
      eyebrow="school \u00b7 school_students"
      endpoint="/api/school/students"
      columns={[{"key": "candidate_id", "label": "candidate id"}, {"key": "student_name", "label": "student name"}, {"key": "grade", "label": "grade"}, {"key": "section", "label": "section"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      createFields={[{ key: "student_name", label: "Student name" }, { key: "grade", label: "Grade" }, { key: "consent_obtained", label: "Consent obtained", type: "checkbox" }]}
    />
  );
}
