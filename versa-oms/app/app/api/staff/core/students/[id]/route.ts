import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_students/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_students", service);
