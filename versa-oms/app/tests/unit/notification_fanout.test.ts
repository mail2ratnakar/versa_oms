import { describe, it, expect } from "vitest";
import { resolveRecipients, channelAddressFor } from "@/server/notifications/fanout";

// Assertions reference the INPUT values (schoolId/contact/fallback), never copied literals — they
// express the contract (which input maps to which output). Domain enum names (school_user, email,
// in_app) are the function's contracted output, asserted as-is. (P0.9 no-hardcoding)
describe("notification fan-out recipient resolution (FR-NOTIFY-FANOUT-0014)", () => {
  const schoolId = "school-9f3a";
  it("resolves a school recipient for a school/coordinator resolver", () => {
    const r = resolveRecipients({ event_code: "school_activated", school_id: schoolId, recipient_resolver: "school_coordinator" }, "in_app");
    expect(r).toEqual([{ recipient_key: `school:${schoolId}`, recipient_type: "school_user", recipient_entity_id: schoolId, school_id: schoolId, channel: "in_app", channel_address: `school:${schoolId}` }]);
  });
  it("returns no recipients for a school resolver with no school_id (won't fabricate)", () => {
    expect(resolveRecipients({ event_code: "x", school_id: null, recipient_resolver: "school_coordinator" }, "in_app")).toEqual([]);
  });
  it("resolves a staff recipient for an ops/manager resolver and honors the channel", () => {
    const channel = "email";
    const r = resolveRecipients({ event_code: "x", school_id: schoolId, recipient_resolver: "operations_manager" }, channel);
    expect(r[0].recipient_type).toBe("staff_user");
    expect(r[0].channel).toBe(channel);
  });
  it("returns no recipients for an unknown resolver", () => {
    expect(resolveRecipients({ event_code: "x", recipient_resolver: "mystery" }, "in_app")).toEqual([]);
  });
});

describe("channel address resolution (FR-NOTIFY-CHANNEL-0016)", () => {
  const contact = { email: "coordinator@example.test", mobile: "+10000000000" };
  const fallback = "school:9f3a";
  it("email channel -> the contact email", () => {
    expect(channelAddressFor("email", contact, fallback)).toBe(contact.email);
  });
  it("sms/whatsapp channel -> the contact mobile", () => {
    expect(channelAddressFor("sms_later", contact, fallback)).toBe(contact.mobile);
    expect(channelAddressFor("whatsapp_later", contact, fallback)).toBe(contact.mobile);
  });
  it("in_app/push -> the logical entity fallback (no mailbox needed)", () => {
    expect(channelAddressFor("in_app", contact, fallback)).toBe(fallback);
    expect(channelAddressFor("push_later", contact, fallback)).toBe(fallback);
  });
  it("falls back to the logical address when the needed contact field is missing", () => {
    expect(channelAddressFor("email", { email: null, mobile: contact.mobile }, fallback)).toBe(fallback);
    expect(channelAddressFor("sms_later", { email: contact.email, mobile: null }, fallback)).toBe(fallback);
  });
});
