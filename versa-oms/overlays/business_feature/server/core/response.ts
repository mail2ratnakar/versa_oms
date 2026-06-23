export function successResponse(input: {
  data: unknown;
  requestId: string;
  moduleId: string;
  auditEventId?: string | null;
}) {
  return {
    ok: true,
    data: input.data,
    meta: {
      request_id: input.requestId,
      server_time: new Date().toISOString(),
      module: input.moduleId,
      audit_event_id: input.auditEventId ?? null
    }
  };
}

export function errorResponse(input: {
  code: string;
  message: string;
  requestId: string;
  moduleId: string;
  status?: number;
  details?: unknown[];
  fieldErrors?: unknown[];
}) {
  return {
    body: {
      ok: false,
      error: {
        code: input.code,
        message: input.message,
        details: input.details ?? [],
        field_errors: input.fieldErrors ?? []
      },
      meta: {
        request_id: input.requestId,
        server_time: new Date().toISOString(),
        module: input.moduleId
      }
    },
    status: input.status ?? 400
  };
}
