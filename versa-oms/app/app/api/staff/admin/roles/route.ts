import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/roles_permissions/service";

export const { GET, POST } = makeStaffRouteHandlers("roles_permissions", service);
