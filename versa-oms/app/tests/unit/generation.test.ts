import { describe, it, expect } from "vitest";
import { deliver, deliveryStats } from "@/server/notifications/delivery";
import { toCsv } from "@/server/lib/exporter";
import { computeInvoiceAmount, receiptNumber } from "@/server/finance/invoicing";

describe("notification delivery", () => {
  it("delivers in-app immediately, queues external", () => {
    expect(deliver("in_app").status).toBe("delivered");
    expect(deliver("email").status).toBe("queued_external");
    expect(deliveryStats(["in_app", "in_app", "email", "sms"])).toEqual({ delivered: 2, queued_external: 2, total: 4 });
  });
});

describe("export generation (CSV + watermark)", () => {
  it("writes a metadata header and escapes special chars", () => {
    const csv = toCsv(
      [{ name: "A, Ltd", note: 'has "quote"' }],
      ["name", "note"],
      { generated_by: "ops1", scope: "finance", classification: "sensitive" }
    );
    expect(csv).toContain("# generated_by: ops1");
    expect(csv).toContain("# classification: sensitive");
    expect(csv).toContain('"A, Ltd"');
    expect(csv).toContain('"has ""quote"""');
  });
  it("neutralizes CSV formula injection", () => {
    const csv = toCsv([{ payload: "=cmd()" }, { payload: "+1+1" }], ["payload"], { generated_by: "x", scope: "t" });
    expect(csv).toContain("'=cmd()");
    expect(csv).toContain("'+1+1");
    expect(csv).not.toMatch(/\n=cmd/);
  });
});

describe("finance computation", () => {
  it("server-calculates invoice amounts with discount + GST", () => {
    const r = computeInvoiceAmount({ unitPrice: 100, studentCount: 10, discount: 50, gstRate: 0.18 });
    expect(r.base).toBe(1000);
    expect(r.taxable).toBe(950);
    expect(r.gst).toBe(171);
    expect(r.total).toBe(1121);
  });
  it("formats a sortable receipt number", () => {
    expect(receiptNumber("delhipublic", 7, 2026)).toBe("RCPT-2026-DELHIP-00007");
  });
});
