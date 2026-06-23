import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/certificate_ops/service";

export const { GET, POST } = makeStaffRouteHandlers("certificate_ops", service);
