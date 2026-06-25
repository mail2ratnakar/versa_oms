import { describe, it, expect } from "vitest";
import { renderCertificatePdf } from "@/server/certificates/certPdf";
import { DOMAIN_EFFECTS } from "@/server/certificates/certEffects";

describe("certificate PDF rendering (FR-CERT-PDF-0005)", () => {
  it("produces a valid PDF document with the certificate details", async () => {
    const buf = await renderCertificatePdf({
      certificate_number: "CERT-AB12CD34",
      candidate_name: "Anita Rao",
      olympiad_name: "Versa Maths Olympiad",
      award: "Gold",
      issued_on: "2026-06-25",
      verification_code: "VRS-1111-2222-3333",
      base_url: "https://example.test",
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-"); // real PDF magic bytes
    expect(buf.byteLength).toBeGreaterThan(1000); // includes an embedded QR image
  });

  it("renders even when optional fields are missing", async () => {
    const buf = await renderCertificatePdf({ certificate_number: "CERT-X", verification_code: "VRS-A-B-C" });
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("the generate domain effect (PDF on generate) is registered", () => {
    expect(typeof DOMAIN_EFFECTS["core_certificates:generate"]).toBe("function");
  });
});
