import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/admin_settings_versions/service";

export const { POST } = makeStaffActionHandler("admin_settings_versions", service);
