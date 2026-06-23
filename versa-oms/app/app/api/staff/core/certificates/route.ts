import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_certificates/service";

export const { GET, POST } = makeStaffRouteHandlers("core_certificates", service);
