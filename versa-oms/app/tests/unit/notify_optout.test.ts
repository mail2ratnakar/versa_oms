import { describe, it, expect } from "vitest";
import { contactHash, filterOptedOut } from "@/server/notifications/fanout";

// Negative pack WF-013-NEG-004 — opted-out recipients must not be delivered to.
describe("notification opt-out filter (WF-013-NEG-004)", () => {
  it("contactHash normalizes case + whitespace", () => {
    expect(contactHash(" Foo@Bar.com ")).toBe(contactHash("foo@bar.com"));
    expect(contactHash("a@x.com")).not.toBe(contactHash("b@x.com"));
  });
  it("drops a recipient whose contact opted out, keeps the rest", () => {
    const recips = [{ channel_address: "a@x.com" }, { channel_address: "b@x.com" }];
    const out = filterOptedOut(recips, new Set([contactHash("a@x.com")]));
    expect(out.suppressed).toBe(1);
    expect(out.kept.map((r) => r.channel_address)).toEqual(["b@x.com"]);
  });
  it("keeps everyone when there are no opt-outs", () => {
    const out = filterOptedOut([{ channel_address: "a@x.com" }, { channel_address: "b@x.com" }], new Set());
    expect(out.suppressed).toBe(0);
    expect(out.kept).toHaveLength(2);
  });
  it("matches regardless of address case/whitespace", () => {
    const out = filterOptedOut([{ channel_address: " A@X.com " }], new Set([contactHash("a@x.com")]));
    expect(out.suppressed).toBe(1);
  });
});
