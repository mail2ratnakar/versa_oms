export type JobStatus = "queued" | "running" | "succeeded" | "dead_letter";

export type JobRun = {
  id: string;
  jobType: string;
  queueId: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  status: JobStatus;
  attempts: number;
  error: string | null;
  result: unknown;
};

export type JobHandler = (
  payload: Record<string, unknown>,
  ctx: { jobType: string; jobId: string }
) => Promise<Record<string, unknown>>;
