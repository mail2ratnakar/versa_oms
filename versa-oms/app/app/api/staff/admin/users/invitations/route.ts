import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/staff_users_invitations/service";

export const { GET, POST } = makeStaffRouteHandlers("staff_users_invitations", service);
