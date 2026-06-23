import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops/service";

export const { GET, POST } = makeStaffRouteHandlers("results_ops", service);
