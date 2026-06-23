import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/admin_settings/service";

export const { GET, PATCH } = makeStaffItemHandlers("admin_settings", service);
