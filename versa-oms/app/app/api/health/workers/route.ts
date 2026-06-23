import { NextResponse } from "next/server";
import { checkWorkers } from "@/server/lib/health";
import { ok, meta } from "@/server/http/envelope";

export async function GET() {
  const r = checkWorkers();
  return NextResponse.json(ok(r, meta(crypto.randomUUID(), "health")), { status: r.ok ? 200 : 503 });
}
