import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_reconciliations/service";

export const { GET, PATCH } = makeStaffItemHandlers("audit_reconciliations", service);
