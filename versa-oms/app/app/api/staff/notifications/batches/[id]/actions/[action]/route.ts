import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/notification_ops_batches/service";

export const { POST } = makeStaffActionHandler("notification_ops_batches", service);
