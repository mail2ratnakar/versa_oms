import { describe, it, expect } from "vitest";
import { resolveRecipients } from "@/server/notifications/fanout";

describe("notification fan-out recipient resolution (FR-NOTIFY-FANOUT-0014)", () => {
  it("resolves a school recipient for a school/coordinator resolver", () => {
    const r = resolveRecipients({ event_code: "school_activated", school_id: "sch-1", recipient_resolver: "school_coordinator" }, "in_app");
    expect(r).toEqual([{ recipient_key: "school:sch-1", recipient_type: "school_user", recipient_entity_id: "sch-1", school_id: "sch-1", channel: "in_app", channel_address: "school:sch-1" }]);
  });
  it("returns no recipients for a school resolver with no school_id (won't fabricate)", () => {
    expect(resolveRecipients({ event_code: "x", school_id: null, recipient_resolver: "school_coordinator" }, "in_app")).toEqual([]);
  });
  it("resolves a staff recipient for an ops/manager resolver and honors the channel", () => {
    const r = resolveRecipients({ event_code: "x", school_id: "s", recipient_resolver: "operations_manager" }, "email");
    expect(r[0].recipient_type).toBe("staff_user");
    expect(r[0].channel).toBe("email");
  });
  it("returns no recipients for an unknown resolver", () => {
    expect(resolveRecipients({ event_code: "x", recipient_resolver: "mystery" }, "in_app")).toEqual([]);
  });
});
