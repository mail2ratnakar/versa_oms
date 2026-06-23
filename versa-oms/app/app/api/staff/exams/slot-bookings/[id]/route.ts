import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_slots_bookings/service";

export const { GET, PATCH } = makeStaffItemHandlers("exam_slots_bookings", service);
