import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_results/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_results", service);
