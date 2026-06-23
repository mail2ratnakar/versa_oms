import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops_publication_windows/service";

export const { GET, POST } = makeStaffRouteHandlers("results_ops_publication_windows", service);
