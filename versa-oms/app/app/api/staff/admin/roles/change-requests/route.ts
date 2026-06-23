import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/roles_permissions_change_requests/service";

export const { GET, POST } = makeStaffRouteHandlers("roles_permissions_change_requests", service);
