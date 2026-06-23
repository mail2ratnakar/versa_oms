import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/company_dashboard/service";

export const { GET, PATCH } = makeStaffItemHandlers("company_dashboard", service);
