import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_exam_materials/service";

export const { GET, POST } = makeStaffRouteHandlers("core_exam_materials", service);
