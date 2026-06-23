import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/reports_exports_requests/service";

export const { POST } = makeStaffActionHandler("reports_exports_requests", service);
