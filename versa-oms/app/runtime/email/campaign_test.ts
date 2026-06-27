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

export async function sendTest(toEmail: string, subject: string, html: string): Promise<{ accepted: boolean; error?: string }> {
  if (!toEmail || toEmail.indexOf("@") < 1) return { accepted: false, error: "a valid test email is required" };
  const gw = emailGateway();
  const r = await gw.transactional.sendTransactional({
    to: toEmail,
    subject: "[TEST] " + fillSample(subject || "Campaign"),
    html: fillSample(html || "<p>(empty body)</p>"),
  });
  return { accepted: r.accepted, error: r.error };
}
