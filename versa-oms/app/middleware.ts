// Global request-body size guard (negative pack GLOBAL-VALID-002 / GLOBAL-FILE-002 / WF-002-NEG-007).
// Rejects oversized request bodies with a 413 BEFORE they reach a route handler — bounds memory and blocks
// trivial payload-flood DoS. JSON APIs get a tight cap; upload/import routes a larger one.
import { NextRequest, NextResponse } from "next/server";

const MB = 1024 * 1024;
const MAX_JSON_BYTES = 1 * MB;
const MAX_UPLOAD_BYTES = 15 * MB;
const UPLOAD_HINTS = ["upload", "answer-sheet", "roster", "import", "material", "/files", "webhook"];

const MUTATING = new Set(["POST", "PUT", "PATCH"]);

export function middleware(request: NextRequest) {
  if (!MUTATING.has(request.method)) return NextResponse.next();
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(declared) || declared <= 0) return NextResponse.next();
  const path = request.nextUrl.pathname;
  const limit = UPLOAD_HINTS.some((h) => path.includes(h)) ? MAX_UPLOAD_BYTES : MAX_JSON_BYTES;
  if (declared > limit) {
    return NextResponse.json(
      { ok: false, error: { code: "PAYLOAD_TOO_LARGE", message: `Request body exceeds the ${Math.round(limit / MB)}MB limit.` }, meta: { module: "http" } },
      { status: 413 }
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
