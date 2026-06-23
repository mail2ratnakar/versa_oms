import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/notification_ops/service";

export const { GET, POST } = makeStaffRouteHandlers("notification_ops", service);
