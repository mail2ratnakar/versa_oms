import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_students/service";

export const { GET, POST } = makeStaffRouteHandlers("core_students", service);
