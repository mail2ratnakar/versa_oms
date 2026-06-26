import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Access Reviews"
      eyebrow="staff \u00b7 security_audit_access_reviews"
      endpoint="/api/staff/security-audit/access-reviews"
      columns={[{"key": "review_code", "label": "Review"}, {"key": "scope", "label": "Scope"}, {"key": "module_id", "label": "Module"}, {"key": "exceptions_found", "label": "Exceptions Found"}, {"key": "status", "label": "Status"}]}
      description="Manage and review access reviews across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Security Audit", "href": "/staff/security-audit"}, {"label": "Access Reviews"}]}
      nextAction="\u2192 Use \u201cNew Access Review\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="security_audit_access_reviews"
      createFields={[{"key": "scope", "label": "Scope", "type": "select", "options": [{"value": "all_roles", "label": "All Roles"}, {"value": "staff_roles", "label": "Staff Roles"}, {"value": "school_users", "label": "School Users"}, {"value": "admin_roles", "label": "Admin Roles"}, {"value": "module_specific", "label": "Module Specific"}]}, {"key": "module_id", "label": "Module", "type": "text"}, {"key": "exceptions_found", "label": "Exceptions Found", "type": "number"}, {"key": "review_note", "label": "Review Note", "type": "text"}, {"key": "closed_at", "label": "Closed At", "type": "date"}]}
      actions={[{"action": "close", "label": "Close", "variant": "light"}, {"action": "archive", "label": "Archive", "variant": "light", "reason": true, "danger": true}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "open", "label": "Open"}, {"value": "in_review", "label": "In Review"}, {"value": "approved", "label": "Approved"}, {"value": "exceptions_found", "label": "Exceptions Found"}, {"value": "closed", "label": "Closed"}, {"value": "archived", "label": "Archived"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
