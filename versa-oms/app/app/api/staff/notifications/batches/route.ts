import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/notification_ops_batches/service";

export const { GET, POST } = makeStaffRouteHandlers("notification_ops_batches", service);
