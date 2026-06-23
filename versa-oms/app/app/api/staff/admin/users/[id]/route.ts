import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/staff_users/service";

export const { GET, PATCH } = makeStaffItemHandlers("staff_users", service);
