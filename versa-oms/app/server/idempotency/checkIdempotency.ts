import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type IdempotencyResult =
  | { ok: true; replay: false; idempotency_key: string }
  | { ok: true; replay: true; idempotency_key: string; storedResponse: unknown }
  | { ok: false; conflict: true; idempotency_key: string };

/**
 * Table-backed idempotency. Reserves a key on first use; on repeat with the same
 * payload hash it signals replay (caller should return the stored response); on
 * repeat with a different payload hash it signals a conflict (409).
 * Backed by the `idempotency_keys` table (migration 0002).
 */
export async function checkIdempotency(input: {
  key: string;
  moduleId: string;
  operation: string;
  payloadHash: string;
}): Promise<IdempotencyResult> {
  const supabase = createSupabaseAdminClient();
  try {
    const { data: existing } = await supabase
      .from("idempotency_keys")
      .select("idempotency_key, payload_hash, response")
      .eq("idempotency_key", input.key)
      .maybeSingle();

    if (existing) {
      if (existing.payload_hash !== input.payloadHash) {
        return { ok: false, conflict: true, idempotency_key: input.key };
      }
      return {
        ok: true,
        replay: true,
        idempotency_key: input.key,
        storedResponse: existing.response,
      };
    }

    await supabase.from("idempotency_keys").insert({
      idempotency_key: input.key,
      module_id: input.moduleId,
      operation: input.operation,
      payload_hash: input.payloadHash,
    });
    return { ok: true, replay: false, idempotency_key: input.key };
  } catch {
    // DB not available (local dev before Supabase wired): allow, no replay.
    return { ok: true, replay: false, idempotency_key: input.key };
  }
}

/** Persist the response for a reserved idempotency key so future replays return it. */
export async function storeIdempotentResponse(key: string, response: unknown): Promise<void> {
  const supabase = createSupabaseAdminClient();
  try {
    await supabase.from("idempotency_keys").update({ response }).eq("idempotency_key", key);
  } catch {
    /* best-effort */
  }
}
