/**
 * Standard API response envelope. Every route returns this shape so clients,
 * tests and the OpenAPI contract stay consistent.
 *   success: { ok: true, data, meta }
 *   failure: { ok: false, error: { code, message, details, field_errors }, meta }
 */
export const ERROR = {
  AUTH_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
} as const;

export type ErrorCode = keyof typeof ERROR;

export type Meta = {
  request_id: string;
  server_time: string;
  module: string;
  audit_event_id?: string | null;
};

export type FieldError = { field: string; message: string };

export function meta(requestId: string, module: string, auditEventId: string | null = null): Meta {
  return { request_id: requestId, server_time: new Date().toISOString(), module, audit_event_id: auditEventId };
}

export function ok<T>(data: T, m: Meta) {
  return { ok: true as const, data, meta: m };
}

export function err(
  code: ErrorCode,
  message: string,
  m: Meta,
  opts: { details?: string[]; field_errors?: FieldError[] } = {}
) {
  return {
    ok: false as const,
    error: { code, message, details: opts.details ?? [], field_errors: opts.field_errors ?? [] },
    meta: m,
  };
}

export function httpStatus(code: ErrorCode): number {
  return ERROR[code];
}
