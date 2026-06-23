import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/roles_permissions_change_requests/service";

export const { POST } = makeStaffActionHandler("roles_permissions_change_requests", service);
