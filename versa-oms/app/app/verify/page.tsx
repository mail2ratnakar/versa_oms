"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Public certificate verification entry (FR-CERT-GENERATION-0004). Enter a code (or arrive via a
// QR link) and view the whitelisted public result at /verify/certificate/[code].
export default function VerifyHome() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c) router.push(`/verify/certificate/${encodeURIComponent(c)}`);
  }

  return (
    <main className="ds-public">
      <div>
        <p className="eyebrow">public · certificate verification</p>
        <h1>Verify a Versa Olympiads certificate</h1>
        <p className="ds-public-lead">Enter the verification code printed on the certificate (or scan its QR code). Only public, whitelisted details are shown — no personal data.</p>
      </div>
      <form onSubmit={submit} className="card" style={{ display: "flex", gap: 8 }}>
        <input
          className="input"
          style={{ flex: 1, fontFamily: "var(--versa-font-mono, monospace)" }}
          placeholder="VRS-XXXX-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Verification code"
        />
        <button className="btn btn-blue" type="submit" disabled={!code.trim()} style={{ width: "auto" }}>Verify</button>
      </form>
    </main>
  );
}
