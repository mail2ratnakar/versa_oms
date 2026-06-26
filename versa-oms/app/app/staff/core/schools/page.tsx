import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Schools"
      eyebrow="staff \u00b7 core_schools"
      endpoint="/api/staff/core/schools"
      columns={[{"key": "school_code", "label": "School"}, {"key": "name", "label": "Name"}, {"key": "board", "label": "Board"}, {"key": "city", "label": "City"}, {"key": "status", "label": "Status"}]}
      description="Manage and review schools across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Core", "href": "/staff/core"}, {"label": "Schools"}]}
      nextAction="\u2192 Use \u201cNew School\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="schools"
      createFields={[{"key": "name", "label": "Name", "type": "text"}, {"key": "board", "label": "Board", "type": "text"}, {"key": "city", "label": "City", "type": "text"}, {"key": "state", "label": "State", "type": "text"}, {"key": "country", "label": "Country", "type": "text"}, {"key": "address", "label": "Address", "type": "text"}, {"key": "principal_name", "label": "Principal Name", "type": "text"}, {"key": "coordinator_name", "label": "Coordinator Name", "type": "text"}, {"key": "coordinator_email", "label": "Coordinator Email", "type": "text"}, {"key": "coordinator_mobile", "label": "Coordinator Mobile", "type": "text"}]}
      actions={[{"action": "start_review", "label": "Start review", "variant": "blue"}, {"action": "approve", "label": "Approve", "variant": "blue", "reason": true}, {"action": "block", "label": "Block", "variant": "light", "reason": true, "danger": true}]}
    />
  );
}
