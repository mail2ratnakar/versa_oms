import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/courier_ops_exceptions/service";

export const { GET, POST } = makeStaffRouteHandlers("courier_ops_exceptions", service);
