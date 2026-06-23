import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/admin_settings_versions/service";

export const { GET, POST } = makeStaffRouteHandlers("admin_settings_versions", service);
