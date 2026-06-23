export type JobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed_temporary"
  | "failed_permanent"
  | "cancelled"
  | "dead_lettered";

export type WorkerJob<TPayload = Record<string, unknown>> = {
  job_id: string;
  job_type: string;
  queue_id: string;
  owner_module: string;
  risk: "low" | "medium" | "high" | "critical";
  payload: TPayload;
  payload_hash: string;
  idempotency_key: string;
  status: JobStatus;
  attempt_count: number;
  max_attempts: number;
  created_at: string;
};

export type WorkerResult = {
  ok: boolean;
  output_entity_id?: string;
  output_file_id?: string;
  error_code?: string;
  error_message?: string;
};
