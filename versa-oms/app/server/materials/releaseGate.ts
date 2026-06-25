// Exam-material release gate (FR-MATERIAL-RELEASE-0018). PURE: decides whether a school may download a
// material file right now, honoring exam_material_ops/school_access_policy.json + release_timer_policy.json:
// access only AFTER release (released package + release_at passed), and never for revoked/superseded
// material. The school-scope check (own school only) is enforced separately at the route. Unit-tested.
const RELEASED_PACKAGE = new Set(["released", "downloaded"]);
const DEAD_PACKAGE = new Set(["revoked", "superseded"]);
const DEAD_FILE = new Set(["revoked", "superseded", "archived"]);

export type ReleaseGateInput = {
  now: Date;
  releaseAt: string | null;
  packageStatus: string;
  fileStatus: string;
};

export function packageReleaseGate(i: ReleaseGateInput): { allowed: boolean; reason?: string } {
  if (DEAD_PACKAGE.has(i.packageStatus) || DEAD_FILE.has(i.fileStatus)) {
    return { allowed: false, reason: "This material has been revoked or superseded and is no longer available." };
  }
  if (!RELEASED_PACKAGE.has(i.packageStatus)) {
    return { allowed: false, reason: "These materials have not been released yet." };
  }
  if (!i.releaseAt || i.now.getTime() < new Date(i.releaseAt).getTime()) {
    return { allowed: false, reason: "These materials are scheduled and not yet available for download." };
  }
  return { allowed: true };
}
