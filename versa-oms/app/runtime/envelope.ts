// FROZEN-KERNEL — the one response envelope. (Next.js adapter wraps these as NextResponse.json at deploy.)
export function ok(data: unknown, status = 200) { return { ok: true as const, status, data }; }
export function err(code: string, status: number, errors: unknown) { return { ok: false as const, status, code, errors }; }
