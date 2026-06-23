import { createHash } from "node:crypto";

/**
 * Certificate verification codes + minimal public-verification projection.
 * Pure where possible; the public projection exposes ONLY whitelisted fields.
 */
export function generateVerificationCode(certificateId: string, salt = "versa"): string {
  const h = createHash("sha256").update(`${salt}:${certificateId}`).digest("hex").slice(0, 12).toUpperCase();
  return `VRS-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
}

/** Data encoded into the certificate QR (points at the public verify route). */
export function qrPayload(verificationCode: string, baseUrl = ""): string {
  return `${baseUrl}/verify/certificate/${verificationCode}`;
}

export type CertificateRecord = {
  id: string;
  candidate_name?: string;
  olympiad_name?: string;
  award?: string;
  status?: string;
  issued_on?: string;
  // ...plus many private fields that must NEVER be exposed publicly
  [k: string]: unknown;
};

const PUBLIC_FIELDS = ["candidate_name", "olympiad_name", "award", "status", "issued_on"] as const;

/** Project a certificate to the minimal public-verification record. */
export function buildPublicVerification(cert: CertificateRecord, verificationCode: string) {
  const out: Record<string, unknown> = { verification_code: verificationCode, certificate_id: cert.id };
  for (const f of PUBLIC_FIELDS) out[f] = cert[f] ?? null;
  return out;
}

/** Public response shown at /verify — never includes private fields. */
export function publicVerificationResponse(row: Record<string, unknown> | null) {
  if (!row) return { verification_status: "not_found" };
  return {
    verification_status: (row.status as string) === "revoked" ? "revoked" : "valid",
    verification_code: row.verification_code ?? null,
    candidate_name: row.candidate_name ?? null,
    olympiad_name: row.olympiad_name ?? null,
    award: row.award ?? null,
    issued_on: row.issued_on ?? null,
  };
}
