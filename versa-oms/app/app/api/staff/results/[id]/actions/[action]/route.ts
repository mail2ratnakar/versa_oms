import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops/service";

export const { POST } = makeStaffActionHandler("results_ops", service);
