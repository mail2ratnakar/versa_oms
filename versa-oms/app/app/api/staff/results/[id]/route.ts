import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops/service";

export const { GET, PATCH } = makeStaffItemHandlers("results_ops", service);
