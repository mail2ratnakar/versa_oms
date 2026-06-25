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
    <main className="main" style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
      <span className="badge">public · certificate verification</span>
      <h1 style={{ marginTop: 12 }}>Verify a Versa Olympiads certificate</h1>
      <p style={{ color: "#5f6368" }}>Enter the verification code printed on the certificate (or scan its QR code).</p>
      <form onSubmit={submit} className="card" style={{ marginTop: 16, padding: 16, display: "flex", gap: 8 }}>
        <input
          className="input"
          style={{ flex: 1, fontFamily: "monospace" }}
          placeholder="VRS-XXXX-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Verification code"
        />
        <button className="btn btn-dark" type="submit" disabled={!code.trim()}>Verify</button>
      </form>
    </main>
  );
}
