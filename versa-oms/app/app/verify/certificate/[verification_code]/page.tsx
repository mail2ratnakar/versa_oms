export default async function CertificateVerifyPage({ params }: { params: Promise<{ verification_code: string }> }) {
  const { verification_code } = await params;
  return (
    <main className="main">
      <span className="badge">public · certificate verification</span>
      <h1>Certificate Verification</h1>
      <p>Verification code: {verification_code}</p>
      <div className="card">
        <p>This is a public minimal-field verification skeleton. Do not expose student contact, parent contact, payment status, raw scores, OMR, answer keys or internal notes.</p>
      </div>
    </main>
  );
}
