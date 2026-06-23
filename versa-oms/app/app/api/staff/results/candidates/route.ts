import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops_candidates/service";

export const { GET, POST } = makeStaffRouteHandlers("results_ops_candidates", service);
