import { describe, it, expect, beforeEach } from "vitest";
import { enqueueJob, drainJobs, listJobRuns, resetJobs } from "@/server/jobs/runner";
import { transitionJobs } from "@/server/jobs/triggers";

describe("worker job runner", () => {
  beforeEach(() => resetJobs());

  it("enqueues and runs a job to success", async () => {
    enqueueJob("certificate.generate", { record_id: "batch-1" }, "k1");
    const res = await drainJobs();
    expect(res.processed).toBe(1);
    expect(res.runs[0].status).toBe("succeeded");
  });

  it("is idempotent on (jobType, key)", () => {
    enqueueJob("notification.dispatch_batch", {}, "same");
    enqueueJob("notification.dispatch_batch", {}, "same");
    expect(listJobRuns().length).toBe(1);
  });

  it("retries then dead-letters a persistently failing job", async () => {
    enqueueJob("test.always_fail", {}, "fk");
    const res = await drainJobs();
    expect(res.runs[0].status).toBe("dead_letter");
    expect(res.runs[0].attempts).toBe(3);
  });

  it("maps transitions to their downstream jobs", () => {
    const jobs = transitionJobs("results_ops", "publish");
    expect(jobs).toContain("certificate.generate");
    expect(jobs).toContain("notification.dispatch_batch");
    expect(transitionJobs("nope", "x")).toEqual([]);
  });
});
