import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Students"
      eyebrow="staff \u00b7 core_students"
      endpoint="/api/staff/core/students"
      columns={[{"key": "candidate_id", "label": "Candidate ID"}, {"key": "student_name", "label": "Student Name"}, {"key": "grade", "label": "Grade"}, {"key": "section", "label": "Section"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="students"
      createFields={[{ key: "student_name", label: "Student Name" }, { key: "grade", label: "Grade" }, { key: "consent_obtained", label: "Consent Obtained", type: "checkbox" }]}
    />
  );
}
