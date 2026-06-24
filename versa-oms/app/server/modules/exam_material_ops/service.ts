import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "template_name": z.string(),
    "template_type": z.string(),
    "template_version": z.string(),
  })
  .passthrough();

export const {
  listModuleRecords,
  createModuleRecord,
  getModuleRecord,
  updateModuleRecord,
  transitionModuleRecord,
  getTransition,
} = defineModuleService({
  moduleId: "exam_material_ops",
  table: "exam_material_templates",
  scope: "staff",
  statusColumn: "template_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_manager", "exam_operations_manager", "material_release_manager", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "exam_operations_manager", "material_release_manager", "operations_head", "question_paper_content_manager", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "download": ["material_release_manager", "school_coordinator", "security_admin_reviewer"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "archive": {"target": "archived", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  listConfig: {"filterColumns": ["template_status", "template_type"], "searchColumns": ["template_code", "template_name"], "sortColumns": ["created_at", "template_status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "template_status", "facetValues": ["draft", "under_review", "approved", "active", "retired", "archived"]},
  createSchema,
});
