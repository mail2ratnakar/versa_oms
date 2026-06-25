import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicVerificationResponse } from "@/server/eval/certificate";
import { ok, meta } from "@/server/http/envelope";

// Naive per-process rate limiter for the public verify endpoint.
const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(code: string): boolean {
  const now = Date.now();
  const e = hits.get(code);
  if (!e || now > e.resetAt) {
    hits.set(code, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  e.count += 1;
  return e.count > 30; // 30 lookups / code / minute
}

export async function GET(_: Request, { params }: { params: Promise<{ verification_code: string }> }) {
  const { verification_code } = await params;
  const requestId = crypto.randomUUID();

  if (rateLimited(verification_code)) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests.", details: [], field_errors: [] }, meta: meta(requestId, "public_verification") },
      { status: 429 }
    );
  }

  let row: Record<string, unknown> | null = null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("public_verification")
      .select("verification_code, status, candidate_name, olympiad_name, award, issued_on, content_hash")
      .eq("verification_code", verification_code)
      .maybeSingle();
    row = (data as Record<string, unknown> | null) ?? null;
  } catch {
    row = null;
  }

  // Only whitelisted minimal fields are ever returned.
  return NextResponse.json(ok(publicVerificationResponse(row), meta(requestId, "public_verification")));
}
