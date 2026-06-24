// FR-MASK-2026-0001 — extended field masking + platform-admin unmask escape.
import { describe, it, expect } from "vitest";
import { maskRecord } from "@/server/masking/masking";
import type { Actor } from "@/server/types";

const rec = { coordinator_email: "alice@school.edu", coordinator_phone: "9998887777", document_file: "file-uuid", setting_value: "s3cr3t", recipient_email: "p@x.com", provider_reference: "PAYREF123456" };
const staff = (roles: string[]): Actor => ({ actor_id: "u", actor_type: "staff", roles, scopes: [] });

describe("FR-MASK-0001 extended masking", () => {
  it("non-privileged staff: PII/secret/file fields are masked", () => {
    const m = maskRecord(rec, staff(["sales_outreach_executive"]));
    expect(m.coordinator_email).toBe("a•••@school.edu");
    expect(m.coordinator_phone).toBe("••••7777");
    expect(m.document_file).toBeNull();           // private file ref
    expect(m.setting_value).toBeNull();           // secret
    expect(m.provider_reference).toBe("••••3456");
  });
  it("super_admin sees everything (platform-admin unmask escape)", () => {
    const m = maskRecord(rec, staff(["super_admin"]));
    expect(m.coordinator_email).toBe("alice@school.edu");
    expect(m.document_file).toBe("file-uuid");
    expect(m.setting_value).toBe("s3cr3t");
  });
  it("privileged module role unmasks its fields but not unrelated secrets", () => {
    const m = maskRecord(rec, staff(["operations_head"]));
    expect(m.coordinator_email).toBe("alice@school.edu");  // onboarding/ops can see coordinator PII
    expect(m.setting_value).toBeNull();                     // but not settings secrets
  });
});
