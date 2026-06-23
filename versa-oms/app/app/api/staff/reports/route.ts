import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/reports_exports/service";

export const { GET, POST } = makeStaffRouteHandlers("reports_exports", service);
