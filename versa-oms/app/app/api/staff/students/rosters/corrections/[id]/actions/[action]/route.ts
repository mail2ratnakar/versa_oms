import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/student_roster_ops_corrections/service";

export const { POST } = makeStaffActionHandler("student_roster_ops_corrections", service);
