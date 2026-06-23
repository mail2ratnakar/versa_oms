import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      status: "ok",
      app: "versa-olympiads-app"
    },
    meta: {
      request_id: crypto.randomUUID(),
      server_time: new Date().toISOString(),
      module: "system",
      audit_event_id: null
    }
  });
}
