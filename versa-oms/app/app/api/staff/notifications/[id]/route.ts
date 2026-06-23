import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/notification_ops/service";

export const { GET, PATCH } = makeStaffItemHandlers("notification_ops", service);
