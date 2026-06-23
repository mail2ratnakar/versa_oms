export const jobRegistry = {
  "material.generate_package": { queue: "materials", ownerModule: "exam_material_ops", risk: "critical" },
  "evaluation.import_validate": { queue: "evaluation", ownerModule: "evaluation_ops", risk: "critical" },
  "results.generate_batch": { queue: "results", ownerModule: "results_ops", risk: "critical" },
  "certificate.generate": { queue: "certificates", ownerModule: "certificate_ops", risk: "high" },
  "notification.dispatch_batch": { queue: "notifications", ownerModule: "notification_ops", risk: "high" },
  "export.generate": { queue: "exports", ownerModule: "reports_exports", risk: "critical" },
  "security.permission_drift_scan": { queue: "security", ownerModule: "security_audit_console", risk: "critical" },
  "backup.health_check": { queue: "maintenance", ownerModule: "admin_settings", risk: "high" }
} as const;
