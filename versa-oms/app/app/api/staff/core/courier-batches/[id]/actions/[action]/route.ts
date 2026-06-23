import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_courier/service";

export const { POST } = makeStaffActionHandler("core_courier", service);
