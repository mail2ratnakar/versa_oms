import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/student_roster_ops/service";

export const { GET, POST } = makeStaffRouteHandlers("student_roster_ops", service);
