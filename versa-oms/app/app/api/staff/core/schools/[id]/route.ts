import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_schools/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_schools", service);
