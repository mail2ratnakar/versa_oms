import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_material_ops_files/service";

export const { GET, PATCH } = makeStaffItemHandlers("exam_material_ops_files", service);
