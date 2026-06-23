import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_omr/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_omr", service);
