export type AlertSeverity = "medium" | "high" | "critical";

export async function raiseAlert(input: {
  alert_id: string;
  severity: AlertSeverity;
  module_id: string;
  message: string;
  request_id?: string;
  job_id?: string;
  safe_context?: Record<string, unknown>;
}) {
  // Replace with alert provider and task/security incident creation.
  return {
    ...input,
    raised_at: new Date().toISOString()
  };
}
