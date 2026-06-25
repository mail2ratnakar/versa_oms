// Certificate domain effects (FRAMEWORK — FR-CERT-GENERATION-0004). Domain computation that
// runs AFTER a kernel transition applies (P3.10) but doesn't fit the declarative chains.json DSL
// (it joins + projects to the PUBLIC whitelist). chains.json stays for declarative cross-module
// data chains; this typed registry is for crypto/join/projection domain effects. Best-effort.
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

// Publish: make the certificate publicly verifiable. Writes a MINIMAL public_verification row —
// ONLY whitelisted fields (candidate_name/status/issued_on); never PII, scores, ids or contacts.
async function effect_publish_certificate(supabase: Db, certId: string, actor: Actor): Promise<void> {
  const { data: cert } = await supabase.from("certificates").select("*").eq("id", certId).maybeSingle();
  if (!cert) return;
  const c = cert as Record<string, unknown>;
  const verificationCode = c["verification_code"] as string | null;
  if (!verificationCode) return; // never publish a cert without a server-generated code

  // candidate_name from the linked student — the only PII surfaced publicly, by spec (whitelisted).
  let candidateName: string | null = null;
  const studentId = c["student_id"] as string | undefined;
  if (studentId) {
    const { data: st } = await supabase.from("students").select("student_name").eq("id", studentId).maybeSingle();
    candidateName = ((st as Record<string, unknown> | null)?.["student_name"] as string) ?? null;
  }

  await supabase.from("public_verification").upsert(
    {
      verification_code: verificationCode,
      certificate_id: certId,
      candidate_name: candidateName,
      status: "valid",
      issued_on: new Date().toISOString().slice(0, 10),
    },
    { onConflict: "verification_code" }
  );
  await supabase.from("certificates").update({ issued_at: new Date().toISOString() }).eq("id", certId);
  await createAuditEvent({
    sourceModule: "core_certificates", action: "publish_certificate", actor,
    entityType: "certificates", entityId: certId, newStatus: "published",
    reason: "certificate published — public verification enabled",
  });
}

// Revoke: the public verification immediately reflects 'revoked' (verification_lifecycle).
async function effect_revoke_certificate(supabase: Db, certId: string, actor: Actor): Promise<void> {
  await supabase.from("public_verification").update({ status: "revoked" }).eq("certificate_id", certId);
  await createAuditEvent({
    sourceModule: "core_certificates", action: "revoke_certificate", actor,
    entityType: "certificates", entityId: certId, newStatus: "revoked",
    reason: "certificate revoked — public verification shows revoked",
  });
}

export const DOMAIN_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  "core_certificates:publish": effect_publish_certificate,
  "core_certificates:revoke": effect_revoke_certificate,
};

export async function runDomainEffect(moduleId: string, action: string, supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const fn = DOMAIN_EFFECTS[`${moduleId}:${action}`];
  if (!fn) return;
  try {
    await fn(supabase, recordId, actor);
  } catch {
    /* best-effort: the transition already applied */
  }
}
