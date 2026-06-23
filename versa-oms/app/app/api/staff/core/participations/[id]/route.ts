import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_participations/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_participations", service);
