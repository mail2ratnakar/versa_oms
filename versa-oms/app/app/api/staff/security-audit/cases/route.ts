import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_cases/service";

export const { GET, POST } = makeStaffRouteHandlers("audit_cases", service);
