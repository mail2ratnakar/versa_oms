import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops_corrections/service";

export const { GET, POST } = makeStaffRouteHandlers("results_ops_corrections", service);
