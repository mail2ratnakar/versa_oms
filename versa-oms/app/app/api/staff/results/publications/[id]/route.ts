import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_publications/service";

export const { GET, PATCH } = makeStaffItemHandlers("results_publications", service);
