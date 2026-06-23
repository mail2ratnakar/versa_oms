import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_publications/service";

export const { GET, POST } = makeStaffRouteHandlers("results_publications", service);
