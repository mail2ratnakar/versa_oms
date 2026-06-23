import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/roles_permissions_change_requests/service";

export const { GET, PATCH } = makeStaffItemHandlers("roles_permissions_change_requests", service);
