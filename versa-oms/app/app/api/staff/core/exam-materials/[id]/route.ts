import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_exam_materials/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_exam_materials", service);
