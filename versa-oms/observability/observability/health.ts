export type HealthStatus = "ok" | "degraded" | "down";

export type HealthCheckResult = {
  name: string;
  status: HealthStatus;
  checked_at: string;
  details?: Record<string, string | number | boolean | null>;
};

export async function createHealthResult(
  name: string,
  status: HealthStatus,
  details: Record<string, string | number | boolean | null> = {}
): Promise<HealthCheckResult> {
  return {
    name,
    status,
    checked_at: new Date().toISOString(),
    details
  };
}
