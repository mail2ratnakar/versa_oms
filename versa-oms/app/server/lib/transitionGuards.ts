// GENERATED from spec/modules/<m>/workflows.json by _validation/gen_guards.py — DO NOT EDIT.
// status -> allowed actions (lifecycle edges). To change, edit the workflow spec and re-run.

export const TRANSITION_GUARDS: Record<string, Record<string, string[]>> = {
  "admin_settings": {
    "draft": ["archive"],
    "under_review": ["archive"],
    "approved": ["archive"],
    "scheduled": ["archive"],
    "active": ["archive"],
    "superseded": ["archive"],
    "rolled_back": ["archive"],
    "rejected": ["archive"],
    "archived": ["archive"]
  },
  "certificate_ops": {
    "draft": ["archive", "retire"],
    "generation_requested": ["archive", "retire"],
    "generated": ["archive", "retire", "start_review"],
    "under_review": ["approve", "archive", "retire"],
    "approved": ["archive", "retire"],
    "published": ["archive", "retire"],
    "downloaded": ["archive", "retire"],
    "reissue_requested": ["archive", "retire"],
    "reissued": ["archive", "retire"],
    "revoked": ["archive", "retire"],
    "superseded": ["archive", "retire"],
    "archived": ["archive", "retire"],
    "failed": ["archive", "retire"]
  },
  "company_dashboard": {
    "request_received": ["archive"],
    "role_resolved": ["archive"],
    "scope_applied": ["archive"],
    "widgets_loaded": ["archive"],
    "view_rendered": ["archive"],
    "permission_denied": ["archive"],
    "partial_data": ["archive"],
    "error": ["archive"]
  },
  "courier_ops": {
    "draft": ["block"],
    "ready_for_dispatch": ["block"],
    "dispatched": ["block"],
    "in_transit": ["block"],
    "delivered": ["block"],
    "exception": ["block"],
    "closed": ["block"],
    "cancelled": ["block"],
    "archived": ["block"]
  },
  "evaluation_ops": {
    "draft": ["approve", "archive", "revoke", "supersede"],
    "uploaded": ["approve", "archive", "revoke", "supersede"],
    "validating": ["approve", "archive", "revoke", "supersede"],
    "validation_failed": ["approve", "archive", "revoke", "supersede"],
    "validated": ["approve", "archive", "revoke", "supersede"],
    "scoring": ["approve", "archive", "revoke", "supersede"],
    "scored": ["approve", "archive", "revoke", "start_review", "supersede"],
    "under_review": ["approve", "archive", "revoke", "supersede"],
    "approved_for_results": ["approve", "archive", "revoke", "supersede"],
    "rejected": ["approve", "archive", "revoke", "supersede"],
    "archived": ["approve", "archive", "revoke", "supersede"]
  },
  "exam_material_ops": {
    "draft": ["archive", "retire"],
    "generation_requested": ["archive", "retire"],
    "generated": ["archive", "retire", "start_review"],
    "under_review": ["approve", "archive", "retire"],
    "approved": ["archive", "retire"],
    "scheduled": ["archive", "retire"],
    "released": ["archive", "retire"],
    "downloaded": ["archive", "retire"],
    "replaced": ["archive", "retire"],
    "revoked": ["archive", "retire"],
    "superseded": ["archive", "retire"],
    "archived": ["archive", "retire"],
    "failed": ["archive", "retire"]
  },
  "exam_slot_ops": {
    "draft": ["archive", "close", "start_review"],
    "under_review": ["approve", "archive", "close"],
    "approved": ["archive", "close", "publish"],
    "published": ["archive", "close"],
    "assignment_open": ["archive", "close"],
    "assignment_closed": ["archive", "close"],
    "locked": ["archive", "close"],
    "cancelled": ["archive", "close"],
    "archived": ["archive", "close"]
  },
  "finance_ops": {
    "draft": ["cancel", "issue", "void"],
    "issued": ["cancel", "mark_paid", "mark_partially_paid", "supersede", "void"],
    "partially_paid": ["cancel", "mark_paid", "supersede"],
    "paid": ["cancel"],
    "cancelled": ["cancel"],
    "voided": ["cancel"],
    "superseded": ["cancel"]
  },
  "notification_ops": {
    "draft": ["archive", "retire"],
    "dry_run": ["archive", "retire", "start_review"],
    "under_review": ["approve", "archive", "retire"],
    "approved": ["archive", "retire"],
    "queued": ["archive", "retire"],
    "sending": ["archive", "retire"],
    "sent": ["archive", "retire"],
    "partially_failed": ["archive", "retire"],
    "failed": ["archive", "retire"],
    "cancelled": ["archive", "retire"],
    "archived": ["archive", "retire"]
  },
  "reports_exports": {
    "draft": ["archive", "retire"],
    "submitted": ["archive", "retire", "start_review"],
    "under_review": ["archive", "retire"],
    "approved": ["archive", "retire"],
    "rejected": ["archive", "retire"],
    "queued": ["archive", "retire"],
    "generating": ["archive", "retire"],
    "generated": ["archive", "retire"],
    "failed": ["archive", "retire"],
    "expired": ["archive", "retire"],
    "cancelled": ["archive", "retire"],
    "archived": ["archive", "retire"]
  },
  "results_ops": {
    "draft": ["archive", "generate", "supersede", "withhold"],
    "generated": ["archive", "supersede", "withhold"],
    "ranking": ["archive", "supersede", "withhold"],
    "ranked": ["archive", "start_review", "supersede", "withhold"],
    "under_review": ["approve", "archive", "supersede", "withhold"],
    "approved": ["archive", "publish", "schedule", "supersede", "withhold"],
    "scheduled": ["archive", "publish", "supersede", "withhold"],
    "published": ["archive", "supersede", "withhold"],
    "partially_published": ["archive", "supersede", "withhold"],
    "withheld": ["archive", "supersede", "withhold"],
    "correction_pending": ["archive", "supersede", "withhold"],
    "corrected": ["archive", "supersede", "withhold"],
    "superseded": ["archive", "supersede", "withhold"],
    "archived": ["archive", "supersede", "withhold"]
  },
  "roles_permissions": {
    "draft": ["archive"],
    "submitted": ["archive"],
    "under_review": ["archive"],
    "approved": ["archive"],
    "rejected": ["archive"],
    "applied": ["archive"],
    "cancelled": ["archive"],
    "archived": ["archive"]
  },
  "school_crm": {
    "new_lead": ["archive"],
    "contacted": ["archive"],
    "brochure_sent": ["archive"],
    "demo_scheduled": ["archive"],
    "demo_completed": ["archive"],
    "proposal_sent": ["archive"],
    "follow_up": ["archive"],
    "payment_pending": ["archive"],
    "converted": ["archive"],
    "lost": ["archive"]
  },
  "school_onboarding_ops": {
    "draft": ["archive", "start_review", "submit"],
    "submitted": ["approve", "archive", "reject", "start_review"],
    "under_review": ["approve", "archive", "reject", "start_review"],
    "needs_more_info": ["archive", "start_review", "submit"],
    "approved": ["activate", "archive", "block", "start_review", "suspend"],
    "rejected": ["archive", "start_review"],
    "activated": ["archive", "block", "start_review", "suspend"],
    "blocked": ["archive", "start_review"],
    "suspended": ["archive", "start_review"],
    "archived": ["archive", "start_review"]
  },
  "staff_users": {
    "invited": [],
    "active": ["suspend"],
    "suspended": [],
    "disabled": ["archive"],
    "exited": ["archive"],
    "archived": []
  },
  "student_roster_ops": {
    "uploaded": ["archive"],
    "validating": ["archive", "validate"],
    "validation_failed": ["archive", "validate"],
    "validated": ["archive", "lock", "submit_for_lock"],
    "submitted_for_lock": ["archive", "lock"],
    "locked": ["archive", "supersede"],
    "unlock_requested": ["archive"],
    "correction_pending": ["archive", "supersede"],
    "superseded": ["archive"],
    "archived": ["archive"]
  },
  "support_tickets": {
    "new": ["archive"],
    "open": ["archive"],
    "assigned": ["archive"],
    "waiting_on_school": ["archive"],
    "waiting_on_staff": ["archive"],
    "escalated": ["archive"],
    "resolved": ["archive"],
    "closed": ["archive"],
    "reopened": ["archive"],
    "archived": ["archive"]
  },
  "task_work_queue": {
    "new": ["archive"],
    "queued": ["archive"],
    "assigned": ["archive"],
    "in_progress": ["archive"],
    "blocked": ["archive"],
    "waiting": ["archive"],
    "escalated": ["archive"],
    "completed": ["archive"],
    "cancelled": ["archive"],
    "reopened": ["archive"],
    "archived": ["archive"]
  },
  "school_roster": {
    "uploaded": [],
    "validating": [],
    "validation_failed": [],
    "validated": ["submit"],
    "submitted_for_lock": [],
    "locked": [],
    "unlock_requested": [],
    "correction_pending": [],
    "superseded": [],
    "archived": []
  }
};

export function isActionAllowedFrom(moduleId: string, status: string | null, action: string): boolean {
  const g = TRANSITION_GUARDS[moduleId];
  if (!g || !status) return true;
  const allowed = g[status];
  if (!allowed) return true;
  return allowed.includes(action);
}
