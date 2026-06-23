import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_certificates/service";

export const { GET, PATCH } = makeStaffItemHandlers("core_certificates", service);
