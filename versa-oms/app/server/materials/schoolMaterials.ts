// School exam-materials list — kernel op (extracted from the route). Enforces the finance gate (payment
// cleared) + the release gate (only released/downloaded packages are visible to a school). FROZEN-KERNEL.
import { isPaymentCleared } from "@/server/finance/financeGate";
import * as service from "@/server/modules/school_materials/service";
import type { Actor } from "@/server/types";

type Result =
  | { data: { items: Array<Record<string, unknown>>; pagination: unknown } }
  | { error: { code: "FORBIDDEN"; message: string; status: number } };

export async function listSchoolMaterials(actor: Actor, searchParams: URLSearchParams): Promise<Result> {
  const cleared = await isPaymentCleared(actor.school_id ?? "");
  if (!cleared) return { error: { code: "FORBIDDEN", message: "Exam materials are locked until payment is cleared.", status: 403 } };
  const data = (await service.listModuleRecords({ actor, searchParams })) as { items: Array<Record<string, unknown>>; pagination: unknown };
  const released = data.items.filter((it) => ["released", "downloaded"].includes(String(it.package_status ?? it.status ?? "")));
  return { data: { items: released, pagination: data.pagination } };
}
