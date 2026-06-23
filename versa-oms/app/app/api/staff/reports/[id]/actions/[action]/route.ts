import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/reports_exports/service";

export const { POST } = makeStaffActionHandler("reports_exports", service);
