import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_slot_ops/service";

export const { POST } = makeStaffActionHandler("exam_slot_ops", service);
