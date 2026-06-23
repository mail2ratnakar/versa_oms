import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/staff_users_assignment_scopes/service";

export const { GET, PATCH } = makeStaffItemHandlers("staff_users_assignment_scopes", service);
