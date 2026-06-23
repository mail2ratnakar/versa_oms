// AUTO-GENERATED from workers/JOB_REGISTRY.json + QUEUE_CONFIG.json. Do not edit by hand.
export type JobDef = { jobType: string; queueId: string; ownerModule: string; risk: string };

export const JOB_REGISTRY: Record<string, JobDef> = {
  "material.generate_package": {
    "jobType": "material.generate_package",
    "queueId": "materials",
    "ownerModule": "exam_material_ops",
    "risk": "critical"
  },
  "material.release_window_scan": {
    "jobType": "material.release_window_scan",
    "queueId": "materials",
    "ownerModule": "exam_material_ops",
    "risk": "critical"
  },
  "material.revoke_package": {
    "jobType": "material.revoke_package",
    "queueId": "materials",
    "ownerModule": "exam_material_ops",
    "risk": "critical"
  },
  "evaluation.import_validate": {
    "jobType": "evaluation.import_validate",
    "queueId": "evaluation",
    "ownerModule": "evaluation_ops",
    "risk": "critical"
  },
  "evaluation.score_batch_generate": {
    "jobType": "evaluation.score_batch_generate",
    "queueId": "evaluation",
    "ownerModule": "evaluation_ops",
    "risk": "critical"
  },
  "results.generate_batch": {
    "jobType": "results.generate_batch",
    "queueId": "results",
    "ownerModule": "results_ops",
    "risk": "critical"
  },
  "results.prepare_publication": {
    "jobType": "results.prepare_publication",
    "queueId": "results",
    "ownerModule": "results_ops",
    "risk": "critical"
  },
  "certificate.generate": {
    "jobType": "certificate.generate",
    "queueId": "certificates",
    "ownerModule": "certificate_ops",
    "risk": "high"
  },
  "certificate.reissue": {
    "jobType": "certificate.reissue",
    "queueId": "certificates",
    "ownerModule": "certificate_ops",
    "risk": "high"
  },
  "notification.dispatch_batch": {
    "jobType": "notification.dispatch_batch",
    "queueId": "notifications",
    "ownerModule": "notification_ops",
    "risk": "high"
  },
  "notification.retry_failed": {
    "jobType": "notification.retry_failed",
    "queueId": "notifications",
    "ownerModule": "notification_ops",
    "risk": "medium"
  },
  "export.generate": {
    "jobType": "export.generate",
    "queueId": "exports",
    "ownerModule": "reports_exports",
    "risk": "critical"
  },
  "export.expire_files": {
    "jobType": "export.expire_files",
    "queueId": "maintenance",
    "ownerModule": "reports_exports",
    "risk": "high"
  },
  "sla.scan_support_tickets": {
    "jobType": "sla.scan_support_tickets",
    "queueId": "sla",
    "ownerModule": "support_tickets",
    "risk": "medium"
  },
  "task.scan_overdue": {
    "jobType": "task.scan_overdue",
    "queueId": "sla",
    "ownerModule": "task_work_queue",
    "risk": "medium"
  },
  "security.permission_drift_scan": {
    "jobType": "security.permission_drift_scan",
    "queueId": "security",
    "ownerModule": "security_audit_console",
    "risk": "critical"
  },
  "security.audit_hash_verify": {
    "jobType": "security.audit_hash_verify",
    "queueId": "security",
    "ownerModule": "security_audit_console",
    "risk": "critical"
  },
  "security.suspicious_login_scan": {
    "jobType": "security.suspicious_login_scan",
    "queueId": "security",
    "ownerModule": "security_audit_console",
    "risk": "high"
  },
  "backup.health_check": {
    "jobType": "backup.health_check",
    "queueId": "maintenance",
    "ownerModule": "admin_settings",
    "risk": "high"
  }
};

export const QUEUE_POLICY = {
  idempotencyRequired: true,
  deadLetterEnabled: true,
  auditHighRisk: true,
  maxAttempts: 3,
};

export function isHighRisk(jobType: string): boolean {
  const d = JOB_REGISTRY[jobType];
  return !!d && (d.risk === 'critical' || d.risk === 'high');
}
