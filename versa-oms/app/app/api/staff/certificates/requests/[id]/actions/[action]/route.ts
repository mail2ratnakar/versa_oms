import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/certificate_ops_requests/service";

export const { POST } = makeStaffActionHandler("certificate_ops_requests", service);
