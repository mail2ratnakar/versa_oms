import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/notification_ops/service";

export const { POST } = makeStaffActionHandler("notification_ops", service);
