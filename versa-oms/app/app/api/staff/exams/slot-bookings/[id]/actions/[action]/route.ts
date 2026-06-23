import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_slots_bookings/service";

export const { POST } = makeStaffActionHandler("exam_slots_bookings", service);
