import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/reports_exports/service";

export const { GET, PATCH } = makeStaffItemHandlers("reports_exports", service);
