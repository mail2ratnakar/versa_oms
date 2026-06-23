import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_slot_ops_reschedules/service";

export const { GET, POST } = makeStaffRouteHandlers("exam_slot_ops_reschedules", service);
