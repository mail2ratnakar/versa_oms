import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/exam_material_ops_files/service";

export const { POST } = makeStaffActionHandler("exam_material_ops_files", service);
