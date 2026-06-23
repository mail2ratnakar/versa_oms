import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_crm/service";

export const { GET, POST } = makeStaffRouteHandlers("school_crm", service);
