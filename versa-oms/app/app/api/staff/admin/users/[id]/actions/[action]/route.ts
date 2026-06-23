import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/staff_users/service";

export const { POST } = makeStaffActionHandler("staff_users", service);
