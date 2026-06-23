import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/company_dashboard/service";

export const { GET, POST } = makeStaffRouteHandlers("company_dashboard", service);
