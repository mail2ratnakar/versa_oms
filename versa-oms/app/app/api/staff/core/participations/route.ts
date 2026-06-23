import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_participations/service";

export const { GET, POST } = makeStaffRouteHandlers("core_participations", service);
