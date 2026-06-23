import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_exam_slots/service";

export const { POST } = makeStaffActionHandler("core_exam_slots", service);
