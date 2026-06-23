import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_courier/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_courier", service);
