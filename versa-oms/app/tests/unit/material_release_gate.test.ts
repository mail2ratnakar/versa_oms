import { describe, it, expect } from "vitest";
import { packageReleaseGate } from "@/server/materials/releaseGate";

// Inputs are explicit (not copied from any external source) — these test the gate's contract. P0.9.
const PAST = "2020-01-01T00:00:00Z";
const FUTURE = "2999-01-01T00:00:00Z";
const now = new Date("2026-06-25T00:00:00Z");

describe("exam-material release gate (FR-MATERIAL-RELEASE-0018)", () => {
  it("allows a released package whose release_at has passed", () => {
    expect(packageReleaseGate({ now, releaseAt: PAST, packageStatus: "released", fileStatus: "released" }).allowed).toBe(true);
  });
  it("allows re-download of an already-downloaded package", () => {
    expect(packageReleaseGate({ now, releaseAt: PAST, packageStatus: "downloaded", fileStatus: "released" }).allowed).toBe(true);
  });
  it("blocks before release_at (scheduled for the future)", () => {
    const r = packageReleaseGate({ now, releaseAt: FUTURE, packageStatus: "released", fileStatus: "released" });
    expect(r.allowed).toBe(false);
    expect(r.reason).toMatch(/not yet|scheduled/i);
  });
  it("blocks an unreleased package (e.g. approved/scheduled)", () => {
    expect(packageReleaseGate({ now, releaseAt: PAST, packageStatus: "approved", fileStatus: "approved" }).allowed).toBe(false);
  });
  it("blocks a revoked package (leak prevention)", () => {
    expect(packageReleaseGate({ now, releaseAt: PAST, packageStatus: "revoked", fileStatus: "released" }).allowed).toBe(false);
  });
  it("blocks a superseded file even if the package is released", () => {
    expect(packageReleaseGate({ now, releaseAt: PAST, packageStatus: "released", fileStatus: "superseded" }).allowed).toBe(false);
  });
  it("blocks when release_at is missing", () => {
    expect(packageReleaseGate({ now, releaseAt: null, packageStatus: "released", fileStatus: "released" }).allowed).toBe(false);
  });
});
