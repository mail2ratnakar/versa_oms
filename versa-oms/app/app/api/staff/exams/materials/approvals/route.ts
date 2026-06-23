import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_material_ops_approvals/service";

export const { GET, POST } = makeStaffRouteHandlers("exam_material_ops_approvals", service);
