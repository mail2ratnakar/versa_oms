import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/student_roster_ops_corrections/service";

export const { GET, PATCH } = makeStaffItemHandlers("student_roster_ops_corrections", service);
