import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/company_dashboard/service";

export const { POST } = makeStaffActionHandler("company_dashboard", service);
