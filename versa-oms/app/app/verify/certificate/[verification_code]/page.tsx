import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicVerificationResponse } from "@/server/eval/certificate";

// Public certificate verification result (FR-CERT-GENERATION-0004; Versa public design FR-PUBLIC-VERIFY-0046).
// Renders ONLY the whitelisted public_verification fields — never PII, scores, OMR, answer keys, internal
// notes or private URLs (PUBLIC_VERIFICATION_UI_RULES). Calm, centered, calm Versa tokens.
export const dynamic = "force-dynamic";

export default async function CertificateVerifyPage({ params }: { params: Promise<{ verification_code: string }> }) {
  const { verification_code } = await params;
  let row: Record<string, unknown> | null = null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("public_verification")
      .select("verification_code, status, candidate_name, olympiad_name, award, issued_on, content_hash")
      .eq("verification_code", verification_code)
      .maybeSingle();
    row = (data as Record<string, unknown> | null) ?? null;
  } catch {
    row = null;
  }
  const r = publicVerificationResponse(row) as Record<string, string | null> & { verification_status: string; integrity_verified: boolean };
  const status = r.verification_status; // valid | revoked | not_found

  const banner = status === "valid"
    ? { cls: "ds-verify-valid", label: "✓ Valid certificate" }
    : status === "revoked"
      ? { cls: "ds-verify-revoked", label: "✕ This certificate has been revoked" }
      : { cls: "ds-verify-none", label: "No certificate found for this code" };

  return (
    <main className="ds-public">
      <div>
        <p className="eyebrow">public · certificate verification</p>
        <h1>Certificate Verification</h1>
      </div>

      <div className={`ds-verify-banner ${banner.cls}`} role="status">
        <strong>{banner.label}</strong>
        {status !== "not_found" && (
          <span className="ds-verify-sub">{r.integrity_verified ? "🔒 Integrity verified — digitally sealed and unaltered." : "⚠ Integrity check failed — this record may have been altered."}</span>
        )}
      </div>

      {status !== "not_found" && (
        <div className="card">
          <dl className="ds-dl">
            {r.candidate_name && (<><dt>Candidate</dt><dd>{r.candidate_name}</dd></>)}
            {r.olympiad_name && (<><dt>Olympiad</dt><dd>{r.olympiad_name}</dd></>)}
            {r.award && (<><dt>Award</dt><dd>{r.award}</dd></>)}
            {r.issued_on && (<><dt>Issued on</dt><dd>{r.issued_on}</dd></>)}
            <dt>Code</dt><dd style={{ fontFamily: "var(--versa-font-mono, monospace)" }}>{verification_code}</dd>
          </dl>
        </div>
      )}

      <p className="ds-public-lead">Only public, whitelisted certificate details are shown. <Link href="/verify">Verify another certificate →</Link></p>
    </main>
  );
}
