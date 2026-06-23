import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Students"
      eyebrow="staff \u00b7 core_students"
      endpoint="/api/staff/core/students"
      columns={[{"key": "candidate_id", "label": "candidate id"}, {"key": "student_name", "label": "student name"}, {"key": "grade", "label": "grade"}, {"key": "section", "label": "section"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="students"
      createFields={[{ key: "student_name", label: "Student name" }, { key: "grade", label: "Grade" }, { key: "consent_obtained", label: "Consent obtained", type: "checkbox" }]}
    />
  );
}
