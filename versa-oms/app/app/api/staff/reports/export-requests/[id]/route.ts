import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/reports_exports_requests/service";

export const { GET, PATCH } = makeStaffItemHandlers("reports_exports_requests", service);
