import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/reports_exports_requests/service";

export const { GET, POST } = makeStaffRouteHandlers("reports_exports_requests", service);
