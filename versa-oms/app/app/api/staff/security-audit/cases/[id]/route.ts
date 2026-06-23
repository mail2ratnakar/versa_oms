import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_cases/service";

export const { GET, PATCH } = makeStaffItemHandlers("audit_cases", service);
