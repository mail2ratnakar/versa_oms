export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export type AppLogEvent = {
  timestamp: string;
  level: LogLevel;
  event_type: string;
  request_id: string;
  correlation_id?: string | null;
  module_id: string;
  actor_type?: "staff" | "school" | "system" | "public" | null;
  actor_id?: string | null;
  route?: string | null;
  method?: string | null;
  status_code?: number | null;
  duration_ms?: number | null;
  entity_type?: string | null;
  entity_id?: string | null;
  job_id?: string | null;
  job_type?: string | null;
  error_code?: string | null;
  message: string;
  safe_context?: Record<string, unknown>;
  redaction_applied: boolean;
  release_id?: string | null;
};
