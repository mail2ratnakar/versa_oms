import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_omr/service";

export const { GET, POST } = makeStaffRouteHandlers("core_omr", service);
