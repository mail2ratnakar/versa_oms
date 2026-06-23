import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/notification_ops_batches/service";

export const { GET, PATCH } = makeStaffItemHandlers("notification_ops_batches", service);
