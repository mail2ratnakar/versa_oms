import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_slots_bookings/service";

export const { GET, POST } = makeStaffRouteHandlers("exam_slots_bookings", service);
