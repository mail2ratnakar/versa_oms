import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/finance_ops_reconciliations/service";

export const { GET, POST } = makeStaffRouteHandlers("finance_ops_reconciliations", service);
