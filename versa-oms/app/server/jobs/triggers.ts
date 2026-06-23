/**
 * Event triggers: which background jobs a status transition fires. This is the
 * cross-module orchestration spine — e.g. publishing results enqueues
 * certificate generation + notification dispatch (the gates' downstream work).
 */
const TRANSITION_JOBS: Record<string, string[]> = {
  "evaluation_ops:approve_for_results": ["results.generate_batch"],
  "core_omr:approve_for_results": ["results.generate_batch"],
  "results_ops:generate": ["results.generate_batch"],
  "results_ops:publish": ["certificate.generate", "notification.dispatch_batch"],
  "core_results:publish": ["certificate.generate", "notification.dispatch_batch"],
  "core_results:generate": ["results.generate_batch"],
  "exam_material_ops:generate": ["material.generate_package"],
  "exam_material_ops:release": ["material.release_window_scan"],
  "exam_material_ops:revoke": ["material.revoke_package"],
  "core_exam_materials:release": ["material.release_window_scan"],
  "certificate_ops:reissue": ["certificate.reissue"],
  "core_certificates:publish": ["notification.dispatch_batch"],
  "notification_ops:approve": ["notification.dispatch_batch"],
};

export function transitionJobs(moduleId: string, action: string): string[] {
  return TRANSITION_JOBS[`${moduleId}:${action}`] ?? [];
}
