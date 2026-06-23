import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/courier_ops/service";

export const { POST } = makeStaffActionHandler("courier_ops", service);
