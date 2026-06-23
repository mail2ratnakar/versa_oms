import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { isPaymentCleared } from "@/server/lib/financeGate";
import * as service from "@/server/modules/school_materials/service";
import { ok, err, meta } from "@/server/http/envelope";

// Custom (not generic) route: enforces the finance gate + release gate before a
// school can see exam materials. Do not replace with the generated handler.
export async function GET(request: NextRequest) {
  const guard = await requireSchoolScope(request, "school_materials");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const cleared = await isPaymentCleared(guard.actor.school_id ?? "");
  if (!cleared) {
    return NextResponse.json(
      err("FORBIDDEN", "Exam materials are locked until payment is cleared.", meta(guard.requestId, "school_materials")),
      { status: 403 }
    );
  }

  const data = (await service.listModuleRecords({ actor: guard.actor, searchParams: request.nextUrl.searchParams })) as {
    items: Array<Record<string, unknown>>;
    pagination: unknown;
  };
  // Release gate: only released/downloaded packages are visible to schools.
  const released = data.items.filter((it) =>
    ["released", "downloaded"].includes(String(it.package_status ?? it.status ?? ""))
  );
  return NextResponse.json(ok({ items: released, pagination: data.pagination }, meta(guard.requestId, "school_materials")));
}
