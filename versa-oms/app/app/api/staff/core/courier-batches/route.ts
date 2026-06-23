import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_courier/service";

export const { GET, POST } = makeStaffRouteHandlers("core_courier", service);
