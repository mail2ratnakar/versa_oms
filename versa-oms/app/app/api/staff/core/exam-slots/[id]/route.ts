import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_exam_slots/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_exam_slots", service);
