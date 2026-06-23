import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_schools/service";

export const { GET, POST } = makeStaffRouteHandlers("core_schools", service);
