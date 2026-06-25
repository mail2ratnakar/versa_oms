import { createHash, createHmac } from "node:crypto";

// Server-side signing secret for the certificate seal (HMAC). An attacker cannot forge a valid seal
// without it, so altering a stored public_verification field is detectable. Dev fallback; set in prod.
const CERT_SIGNING_SECRET = process.env.CERT_SIGNING_SECRET ?? "versa-dev-cert-seal";

// The whitelisted public fields the seal covers, in a stable order. Pure.
const SEAL_FIELDS = ["verification_code", "candidate_name", "olympiad_name", "award", "issued_on", "status"] as const;
function canonicalCert(fields: Record<string, unknown>): string {
  return SEAL_FIELDS.map((k) => `${k}=${fields[k] ?? ""}`).join("|");
}

/** Tamper-evident HMAC seal over a certificate's public fields. Pure (unit-tested). */
export function certificateSeal(fields: Record<string, unknown>, secret: string = CERT_SIGNING_SECRET): string {
  return createHmac("sha256", secret).update(canonicalCert(fields)).digest("hex");
}

/** True only if `seal` matches a freshly computed seal over `fields` (detects any field tampering). */
export function verifyCertificateSeal(fields: Record<string, unknown>, seal: string | null | undefined, secret: string = CERT_SIGNING_SECRET): boolean {
  if (!seal) return false;
  return certificateSeal(fields, secret) === seal;
}

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

/** Public response shown at /verify — never includes private fields. integrity_verified is true only
 * when the stored seal matches the returned public fields (tamper-evidence). */
export function publicVerificationResponse(row: Record<string, unknown> | null) {
  if (!row) return { verification_status: "not_found", integrity_verified: false };
  return {
    verification_status: (row.status as string) === "revoked" ? "revoked" : "valid",
    integrity_verified: verifyCertificateSeal(row, row.content_hash as string | null | undefined),
    verification_code: row.verification_code ?? null,
    candidate_name: row.candidate_name ?? null,
    olympiad_name: row.olympiad_name ?? null,
    award: row.award ?? null,
    issued_on: row.issued_on ?? null,
  };
}
