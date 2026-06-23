import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/staff_users/service";

export const { GET, POST } = makeStaffRouteHandlers("staff_users", service);
