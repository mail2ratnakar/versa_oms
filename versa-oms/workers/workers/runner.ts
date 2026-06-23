import type { WorkerJob, WorkerResult } from "./types";

export async function runWorkerJob(job: WorkerJob): Promise<WorkerResult> {
  switch (job.job_type) {
    case "material.generate_package":
      return { ok: true, output_entity_id: "material_package_placeholder" };
    case "evaluation.import_validate":
      return { ok: true, output_entity_id: "evaluation_import_placeholder" };
    case "results.generate_batch":
      return { ok: true, output_entity_id: "result_batch_placeholder" };
    case "certificate.generate":
      return { ok: true, output_entity_id: "certificate_placeholder" };
    case "notification.dispatch_batch":
      return { ok: true, output_entity_id: "notification_batch_placeholder" };
    case "export.generate":
      return { ok: true, output_file_id: "export_file_placeholder" };
    case "security.permission_drift_scan":
      return { ok: true, output_entity_id: "permission_drift_scan_placeholder" };
    default:
      return {
        ok: false,
        error_code: "UNIMPLEMENTED_JOB_TYPE",
        error_message: `Job type not implemented: ${job.job_type}`
      };
  }
}
