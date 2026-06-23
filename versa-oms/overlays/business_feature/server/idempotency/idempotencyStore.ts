import crypto from "node:crypto";
import { db } from "@/server/core/db";

export function hashPayload(payload: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function checkIdempotency(input: {
  idempotencyKey: string;
  moduleId: string;
  operation: string;
  actorId: string;
  payload: unknown;
}) {
  const payloadHash = hashPayload(input.payload);
  const existing = await db.query<{
    idempotency_key: string;
    payload_hash: string;
    response_snapshot: unknown;
    status: string;
  }>("select idempotency_key, payload_hash, response_snapshot, status from idempotency_keys where idempotency_key = $1", [input.idempotencyKey]);

  if (existing[0]) {
    if (existing[0].payload_hash !== payloadHash) {
      return { ok: false as const, conflict: true as const, replay: false as const };
    }
    return { ok: true as const, conflict: false as const, replay: true as const, response: existing[0].response_snapshot };
  }

  await db.execute(
    "insert into idempotency_keys (idempotency_key, module_id, operation, actor_id, payload_hash, status) values ($1,$2,$3,$4,$5,'in_progress')",
    [input.idempotencyKey, input.moduleId, input.operation, input.actorId, payloadHash]
  );

  return { ok: true as const, conflict: false as const, replay: false as const };
}

export async function completeIdempotency(input: {
  idempotencyKey: string;
  response: unknown;
}) {
  await db.execute(
    "update idempotency_keys set response_snapshot = $2, status = 'completed' where idempotency_key = $1",
    [input.idempotencyKey, JSON.stringify(input.response)]
  );
}
