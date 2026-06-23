import { NextResponse } from "next/server";
import { checkStorage } from "@/server/lib/health";
import { ok, meta } from "@/server/http/envelope";

export async function GET() {
  const r = await checkStorage();
  return NextResponse.json(ok(r, meta(crypto.randomUUID(), "health")), { status: r.ok ? 200 : 503 });
}
