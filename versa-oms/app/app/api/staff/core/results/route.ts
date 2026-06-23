import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_results/service";

export const { GET, POST } = makeStaffRouteHandlers("core_results", service);
