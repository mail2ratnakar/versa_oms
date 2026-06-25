import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicVerificationResponse } from "@/server/eval/certificate";

// Public certificate verification result (FR-CERT-GENERATION-0004). Renders ONLY the whitelisted
// fields from public_verification — never PII, scores, OMR, answer keys or internal notes.
export const dynamic = "force-dynamic";

export default async function CertificateVerifyPage({ params }: { params: Promise<{ verification_code: string }> }) {
  const { verification_code } = await params;
  let row: Record<string, unknown> | null = null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("public_verification")
      .select("verification_code, status, candidate_name, olympiad_name, award, issued_on")
      .eq("verification_code", verification_code)
      .maybeSingle();
    row = (data as Record<string, unknown> | null) ?? null;
  } catch {
    row = null;
  }
  const r = publicVerificationResponse(row) as Record<string, string | null> & { verification_status: string };
  const status = r.verification_status; // valid | revoked | not_found

  const banner =
    status === "valid"
      ? { color: "#1b7f4d", bg: "#e7f6ee", label: "✓ Valid certificate" }
      : status === "revoked"
        ? { color: "#b3261e", bg: "#fce8e6", label: "✕ This certificate has been revoked" }
        : { color: "#5f6368", bg: "#f1f3f4", label: "No certificate found for this code" };

  return (
    <main className="main" style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <span className="badge">public · certificate verification</span>
      <h1 style={{ marginTop: 12 }}>Certificate Verification</h1>

      <div className="card" style={{ marginTop: 16, borderLeft: `4px solid ${banner.color}`, background: banner.bg, padding: 16 }}>
        <strong style={{ color: banner.color }}>{banner.label}</strong>
      </div>

      {status !== "not_found" ? (
        <div className="card" style={{ marginTop: 12, padding: 16 }}>
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: 0 }}>
            {r.candidate_name ? (<><dt style={{ color: "#5f6368" }}>Candidate</dt><dd style={{ margin: 0 }}>{r.candidate_name}</dd></>) : null}
            {r.olympiad_name ? (<><dt style={{ color: "#5f6368" }}>Olympiad</dt><dd style={{ margin: 0 }}>{r.olympiad_name}</dd></>) : null}
            {r.award ? (<><dt style={{ color: "#5f6368" }}>Award</dt><dd style={{ margin: 0 }}>{r.award}</dd></>) : null}
            {r.issued_on ? (<><dt style={{ color: "#5f6368" }}>Issued on</dt><dd style={{ margin: 0 }}>{r.issued_on}</dd></>) : null}
            <dt style={{ color: "#5f6368" }}>Code</dt><dd style={{ margin: 0, fontFamily: "monospace" }}>{verification_code}</dd>
          </dl>
        </div>
      ) : null}

      <p style={{ marginTop: 16, fontSize: 13, color: "#5f6368" }}>
        Only public, whitelisted certificate details are shown. <Link href="/verify">Verify another certificate &rarr;</Link>
      </p>
    </main>
  );
}
