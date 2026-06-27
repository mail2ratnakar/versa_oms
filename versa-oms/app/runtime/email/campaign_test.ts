// FROZEN-KERNEL — send ONE test email of a campaign body to a single address (a compose-time check before
// the real send). Uses the transactional channel; fills merge tags with sample values because a test goes to
// one inbox, not a Brevo list. Called by the dev-server route /api/campaign/test (POST {email, subject, html}).
import { emailGateway } from "./gateway";

function fillSample(s: string): string {
  return String(s || "")
    .replace(/\{\{\s*school_name\s*\}\}/gi, "Greenwood High")
    .replace(/\{\{\s*city\s*\}\}/gi, "Pune")
    .replace(/\{\{\s*state\s*\}\}/gi, "Maharashtra");
}

// Open-relay guard. There is no auth yet (auth-last), and the dev route is unauthenticated. The console adapter
// sends nothing real, so in dev any address is harmless. But if a REAL transactional provider is configured,
// only send to an explicitly allow-listed address (CAMPAIGN_TEST_ALLOWLIST, comma-separated) so a keyed instance
// can never be abused as an open relay to arbitrary recipients. Replace with a staff-session check at auth-last.
function realProvider(): boolean {
  return (process.env.TRANSACTIONAL_PROVIDER || "console").toLowerCase() !== "console";
}
function allowListed(email: string): boolean {
  const allow = (process.env.CAMPAIGN_TEST_ALLOWLIST || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return allow.includes(email.toLowerCase());
}

export async function sendTest(toEmail: string, subject: string, html: string): Promise<{ accepted: boolean; error?: string }> {
  if (!toEmail || toEmail.indexOf("@") < 1) return { accepted: false, error: "a valid test email is required" };
  if (realProvider() && !allowListed(toEmail)) return { accepted: false, error: "recipient not allow-listed for test sends — set CAMPAIGN_TEST_ALLOWLIST" };
  const gw = emailGateway();
  const r = await gw.transactional.sendTransactional({
    to: toEmail,
    subject: "[TEST] " + fillSample(subject || "Campaign"),
    html: fillSample(html || "<p>(empty body)</p>"),
  });
  return { accepted: r.accepted, error: r.error };
}
