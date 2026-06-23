import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_slot_ops_reschedules/service";

export const { GET, PATCH } = makeStaffItemHandlers("exam_slot_ops_reschedules", service);
