import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_payments/service";

export const { GET, POST } = makeStaffRouteHandlers("core_payments", service);
