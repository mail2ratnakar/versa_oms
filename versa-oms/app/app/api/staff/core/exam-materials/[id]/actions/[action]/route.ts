import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_exam_materials/service";

export const { POST } = makeStaffActionHandler("core_exam_materials", service);
