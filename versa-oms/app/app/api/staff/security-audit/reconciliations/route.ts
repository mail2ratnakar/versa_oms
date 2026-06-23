import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_reconciliations/service";

export const { GET, POST } = makeStaffRouteHandlers("audit_reconciliations", service);
